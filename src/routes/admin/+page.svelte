<script lang="ts">
	import { Users, Ban, Package, Clock, ShieldAlert, Activity, CheckCircle2, Hourglass, XCircle } from 'lucide-svelte';

	let { data } = $props();

	type StatCard = {
		label: string;
		value: number | string;
		icon: typeof Users;
		href?: string;
		tone: 'neutral' | 'amber' | 'red' | 'emerald' | 'zig';
	};

	const toneClasses: Record<StatCard['tone'], string> = {
		neutral: 'bg-slate-50 text-slate-700',
		amber: 'bg-amber-50 text-amber-700',
		red: 'bg-red-50 text-red-700',
		emerald: 'bg-emerald-50 text-emerald-700',
		zig: 'bg-zig-50 text-zig-700'
	};

	const cards = $derived<StatCard[]>([
		{
			label: 'Total users',
			value: data.userStats.total,
			icon: Users,
			href: '/admin/users',
			tone: 'neutral'
		},
		{
			label: 'Banned users',
			value: data.userStats.banned,
			icon: Ban,
			href: '/admin/users',
			tone: data.userStats.banned > 0 ? 'red' : 'neutral'
		},
		{
			label: 'Joined last 7 days',
			value: data.userStats.joinedLast7d,
			icon: Activity,
			tone: 'emerald'
		},
		{
			label: 'Total packages',
			value: data.packageStats.total,
			icon: Package,
			href: '/admin/packages',
			tone: 'neutral'
		},
		{
			label: 'Approved packages',
			value: data.packageStats.approved,
			icon: CheckCircle2,
			href: '/admin/packages?status=approved',
			tone: 'emerald'
		},
		{
			label: 'Pending review',
			value: data.packageStats.pending,
			icon: Hourglass,
			href: '/admin/packages?status=pending',
			tone: data.packageStats.pending > 0 ? 'amber' : 'neutral'
		},
		{
			label: 'Rejected packages',
			value: data.packageStats.rejected,
			icon: XCircle,
			href: '/admin/packages?status=rejected',
			tone: data.packageStats.rejected > 0 ? 'red' : 'neutral'
		},
		{
			label: 'Manual submissions',
			value: data.packageStats.manual,
			icon: ShieldAlert,
			href: '/admin/packages?origin=manual',
			tone: 'zig'
		},
		{
			label: 'Flagged packages',
			value: data.flaggedCount,
			icon: ShieldAlert,
			href: '/moderation?tab=flagged',
			tone: data.flaggedCount > 0 ? 'amber' : 'neutral'
		},
		{
			label: 'Active sessions',
			value: data.activeSessions,
			icon: Activity,
			tone: 'neutral'
		}
	]);
</script>

<svelte:head>
	<title>Admin — zigpkg</title>
	<meta name="description" content="Admin dashboard." />
</svelte:head>

<div class="mx-auto max-w-5xl px-6 sm:px-10 py-10">
	<div class="mb-6 flex items-center gap-2">
		<h1 class="text-2xl font-semibold text-slate-900">Admin</h1>
		<span class="inline-flex items-center gap-1 rounded-full bg-zig-50 px-2.5 py-1 font-mono text-xs font-medium text-zig-700">
			<ShieldAlert class="h-3 w-3" />
			Dashboard
		</span>
	</div>

	<!-- Quick links -->
	<div class="mb-8 flex flex-wrap gap-2">
		<a
			href="/admin/users"
			class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-600 transition-colors hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
		>
			<Users class="h-3.5 w-3.5" />
			Users
		</a>
		<a
			href="/admin/packages"
			class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-600 transition-colors hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
		>
			<Package class="h-3.5 w-3.5" />
			Packages
		</a>
		<a
			href="/admin/moderators"
			class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-600 transition-colors hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
		>
			<Users class="h-3.5 w-3.5" />
			Moderators
		</a>
		<a
			href="/moderation"
			class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-600 transition-colors hover:border-zig-300 hover:bg-zig-50 hover:text-zig-700"
		>
			<Clock class="h-3.5 w-3.5" />
			Package moderation
		</a>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
		{#each cards as card (card.label)}
			<a
				href={card.href ?? '#'}
				class="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-zig-300 hover:bg-zig-50/30"
			>
				<div class="flex items-center justify-between">
					<span class="font-mono text-[11px] uppercase tracking-wide text-slate-500">{card.label}</span>
					<span class="inline-flex h-6 w-6 items-center justify-center rounded {toneClasses[card.tone]}">
						<card.icon class="h-3.5 w-3.5" />
					</span>
				</div>
				<p class="mt-2 font-mono text-2xl font-semibold text-slate-900">{card.value}</p>
			</a>
		{/each}
	</div>
</div>
