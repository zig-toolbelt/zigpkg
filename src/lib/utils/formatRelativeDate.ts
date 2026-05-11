export function formatRelativeDate(isoDate: string): { days: number; label: string } {
	const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
	let label: string;
	if (days === 0) label = 'today';
	else if (days === 1) label = 'yesterday';
	else if (days < 30) label = `${days} days ago`;
	else if (days < 365) {
		const months = Math.floor(days / 30);
		label = `${months} ${months === 1 ? 'month' : 'months'} ago`;
	}
	else label = `${Math.floor(days / 365)} years ago`;
	return { days, label };
}
