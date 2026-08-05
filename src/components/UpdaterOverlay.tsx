import { useAutoUpdater } from '../hooks/useAutoUpdater';

export function UpdaterOverlay() {
    const { isUpdating, progress, error } = useAutoUpdater();

    if (!isUpdating) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-96 rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Updating Samvad...
                </h3>

                {error ? (
                    <div className="mt-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Update failed: {error}
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Downloading the latest version. The application will restart automatically.
                        </p>

                        {/* Progress Bar Track */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            {/* Progress Bar Fill */}
                            <div
                                className="h-full bg-blue-600 transition-all duration-200 ease-out dark:bg-blue-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="mt-2 text-right text-xs font-medium text-gray-500">
                            {Math.round(progress)}%
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}