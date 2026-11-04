export const corePageKeys = ['home','about','products','applications','services','testing-standards','clients','why-choose-us','blog','contact','gallery','privacy-policy','terms-of-service'];
export const reservedPageSlugs = new Set([...corePageKeys,'admin','api','login','media','_next','global']);
export const pageRoute = row => row.key === 'home' ? '/' : '/' + row.slug;
