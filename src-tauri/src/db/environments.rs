use sqlx::SqlitePool;
use std::collections::HashMap;

use crate::db::{new_id, now_iso};
use crate::error::AppResult;
use crate::models::{Environment, EnvironmentVariable, EnvironmentWithVariables};

pub async fn list_environments(
    pool: &SqlitePool,
    workspace_id: &str,
) -> AppResult<Vec<EnvironmentWithVariables>> {
    let environments = sqlx::query_as::<_, Environment>(
        "SELECT id, workspace_id, name, sort_order FROM environments \
         WHERE workspace_id = ? ORDER BY sort_order ASC",
    )
    .bind(workspace_id)
    .fetch_all(pool)
    .await?;

    let mut out = Vec::with_capacity(environments.len());
    for environment in environments {
        let variables = list_variables(pool, &environment.id).await?;
        out.push(EnvironmentWithVariables {
            environment,
            variables,
        });
    }
    Ok(out)
}

pub async fn list_variables(
    pool: &SqlitePool,
    environment_id: &str,
) -> AppResult<Vec<EnvironmentVariable>> {
    let rows = sqlx::query_as::<_, EnvironmentVariable>(
        "SELECT id, environment_id, key, value, enabled, is_secret FROM environment_variables \
         WHERE environment_id = ? ORDER BY sort_order ASC",
    )
    .bind(environment_id)
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn create_environment(
    pool: &SqlitePool,
    workspace_id: &str,
    name: &str,
) -> AppResult<Environment> {
    let environment = Environment {
        id: new_id(),
        workspace_id: workspace_id.to_string(),
        name: name.to_string(),
        sort_order: 0,
    };
    sqlx::query(
        "INSERT INTO environments (id, workspace_id, name, sort_order, created_at, updated_at) \
         VALUES (?, ?, ?, 0, ?, ?)",
    )
    .bind(&environment.id)
    .bind(&environment.workspace_id)
    .bind(&environment.name)
    .bind(now_iso())
    .bind(now_iso())
    .execute(pool)
    .await?;
    Ok(environment)
}

pub async fn rename_environment(pool: &SqlitePool, id: &str, name: &str) -> AppResult<()> {
    sqlx::query("UPDATE environments SET name = ?, updated_at = ? WHERE id = ?")
        .bind(name)
        .bind(now_iso())
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn delete_environment(pool: &SqlitePool, id: &str) -> AppResult<()> {
    sqlx::query("DELETE FROM environments WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

/// Replaces every variable for an environment with the given set — the
/// frontend always edits the whole variable table at once (see the
/// Environment editor), so a clear-then-insert is simpler and avoids
/// reconciling row-level diffs.
pub async fn replace_variables(
    pool: &SqlitePool,
    environment_id: &str,
    variables: &[EnvironmentVariable],
) -> AppResult<()> {
    let mut tx = pool.begin().await?;

    sqlx::query("DELETE FROM environment_variables WHERE environment_id = ?")
        .bind(environment_id)
        .execute(&mut *tx)
        .await?;

    for (index, var) in variables.iter().enumerate() {
        sqlx::query(
            "INSERT INTO environment_variables \
             (id, environment_id, key, value, enabled, is_secret, sort_order) \
             VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(if var.id.is_empty() {
            new_id()
        } else {
            var.id.clone()
        })
        .bind(environment_id)
        .bind(&var.key)
        .bind(&var.value)
        .bind(var.enabled)
        .bind(var.is_secret)
        .bind(index as i64)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}

/// Loads the active environment's enabled variables as a flat map, ready
/// for `interpolate`. Returns an empty map if no environment is active.
pub async fn active_variable_map(
    pool: &SqlitePool,
    active_environment_id: Option<&str>,
) -> AppResult<HashMap<String, String>> {
    let Some(env_id) = active_environment_id else {
        return Ok(HashMap::new());
    };
    let vars = list_variables(pool, env_id).await?;
    Ok(vars
        .into_iter()
        .filter(|v| v.enabled)
        .map(|v| (v.key, v.value))
        .collect())
}

/// Replaces every `{{key}}` placeholder in `input` with the matching
/// variable value. Unmatched placeholders are left as-is rather than
/// silently emptied, so a typo'd variable name is obvious in the sent
/// request instead of producing an empty string.
pub fn interpolate(input: &str, variables: &HashMap<String, String>) -> String {
    if !input.contains("{{") {
        return input.to_string();
    }

    let mut output = String::with_capacity(input.len());
    let mut rest = input;

    while let Some(start) = rest.find("{{") {
        output.push_str(&rest[..start]);
        let after_start = &rest[start + 2..];

        match after_start.find("}}") {
            Some(end) => {
                let key = after_start[..end].trim();
                match variables.get(key) {
                    Some(value) => output.push_str(value),
                    None => {
                        output.push_str("{{");
                        output.push_str(key);
                        output.push_str("}}");
                    }
                }
                rest = &after_start[end + 2..];
            }
            None => {
                // Unterminated `{{` — treat the rest of the string literally.
                output.push_str("{{");
                rest = after_start;
                break;
            }
        }
    }

    output.push_str(rest);
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn interpolates_known_keys_and_preserves_unknown_ones() {
        let mut vars = HashMap::new();
        vars.insert(
            "base_url".to_string(),
            "https://api.example.com".to_string(),
        );

        let result = interpolate("{{base_url}}/users/{{user_id}}", &vars);
        assert_eq!(result, "https://api.example.com/users/{{user_id}}");
    }

    #[test]
    fn leaves_plain_strings_untouched() {
        let vars = HashMap::new();
        assert_eq!(
            interpolate("no placeholders here", &vars),
            "no placeholders here"
        );
    }
}
