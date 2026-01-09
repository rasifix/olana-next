import { ranking } from '@rasifix/orienteering-utils';
import { useTranslation } from 'react-i18next';

interface RunnerSelectorSheetProps {
    runners: ranking.RankingRunner[];
    selectedRunners: Set<number>;
    onToggleRunner: (index: number) => void;
    onConfirm: () => void;
    onClose: () => void;
}

function RunnerSelectorSheet({
    runners,
    selectedRunners,
    onToggleRunner,
    onConfirm,
    onClose
}: RunnerSelectorSheetProps) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center">
            {/* Backdrop only on desktop */}
            <div
                className="hidden sm:block fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Bottom sheet on mobile, modal on desktop */}
            <div className="relative w-full sm:max-w-2xl sm:mx-4 bg-surface-primary rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col animate-slide-up sm:border sm:border-border-default sm:relative pb-safe">
                {/* Handle bar for mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1 bg-border-default rounded-full" />
                </div>

                <div className="p-6 pb-6 sm:pb-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-text-primary">
                            {t('runner.selectRunners')}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-2xl text-text-muted hover:text-text-primary transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    <p className="text-sm text-text-tertiary mb-4">
                        {t('runner.selectUpTo5')} ({selectedRunners.size}/5)
                    </p>

                    <div className="flex-1 overflow-y-auto space-y-2 mb-6 -mx-2 px-2">
                        {runners.map((runner, index) => (
                            <label
                                key={runner.id || index}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedRunners.has(index)
                                    ? 'bg-primary-bg border-primary-default shadow-sm'
                                    : 'bg-bg-secondary border-border-default hover:border-border-hover active:scale-[0.98]'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-2 border-border-default checked:bg-primary-default checked:border-primary-default focus:ring-2 focus:ring-primary-default focus:ring-offset-2"
                                    checked={selectedRunners.has(index)}
                                    onChange={() => onToggleRunner(index)}
                                    disabled={!selectedRunners.has(index) && selectedRunners.size >= 5}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-text-primary truncate">
                                        {runner.rank}. {runner.fullName} {runner.time}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border-default pb-safe">
                        <button
                            onClick={onConfirm}
                            disabled={selectedRunners.size < 2}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('button.showGraph')} ({selectedRunners.size})
                        </button>
                        <button
                            onClick={onClose}
                            className="btn-secondary px-6"
                        >
                            {t('button.cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RunnerSelectorSheet;
