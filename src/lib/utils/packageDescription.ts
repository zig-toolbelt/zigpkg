type DescribablePackage = {
	name: string;
	description: string | null;
	packageType: string;
	owner: string;
};

export function packageDescription(pkg: DescribablePackage): string {
	return (
		pkg.description ||
		`${pkg.name} — a Zig ${pkg.packageType} by ${pkg.owner}. View source, install instructions, and documentation on zigpkg.`
	);
}
