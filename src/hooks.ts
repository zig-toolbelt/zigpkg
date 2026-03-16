import { deLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute = ({ url }: { url: URL }) => deLocalizeUrl(url).pathname;
