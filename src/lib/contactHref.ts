interface ContactHrefOptions {
  source: string;
  packageName?: string;
  area?: string;
  cta?: string;
}

export function buildContactHref({ source, packageName, area, cta }: ContactHrefOptions): string {
  const params = new URLSearchParams();

  if (source) params.set('kaynak', source);
  if (packageName) params.set('paket', packageName);
  if (area) params.set('alan', area);
  if (cta) params.set('cta', cta);

  const query = params.toString();
  return query ? `/iletisim/?${query}` : '/iletisim/';
}
