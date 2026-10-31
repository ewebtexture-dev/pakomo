import BlogListingRefresh from './BlogListingRefresh';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import SafeImage from '@/components/shared/SafeImage';
import {plainText} from '@/cms/plain-text';
import {paginationItems,listingDate} from '@/cms/blog-features';
import {listingSchema} from '@/server/blog-listing';
import blogBanner from '@assets/Unsplash/blog-1.jpg';

export default function BlogListing({model}) {
  const {settings,posts,categories,category,page,totalPages,path}=model;
  const pageHref=n=>path+(n>1?'?page='+n:'');
  const schema=listingSchema(model);
  return <>
    <BlogListingRefresh/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
    <PageHeader title={plainText(settings.bannerHeading)} breadcrumbs={[{label:settings.breadcrumbLabel,...(category?{path:'/blog'}:{})},...(category?[{label:category.name}]:[])]} image={typeof model.bannerImage==='object'?model.bannerImage.src:model.bannerImage||blogBanner.src}/>
    <section className="py-12 sm:py-16" aria-label="Blog articles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {settings.introHeading&&<h2 className="text-2xl sm:text-3xl font-bold text-foreground">{plainText(settings.introHeading)}</h2>}
          {settings.introDescription&&<p className="text-muted-foreground mt-4 leading-relaxed">{plainText(settings.introDescription)}</p>}
        </div>
        {settings.showCategories&&<nav aria-label="Blog category filter" className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-9">
          <Link prefetch={false} href="/blog" aria-current={!category?'page':undefined} className={'px-4 py-2 rounded-full border text-sm transition-colors '+(!category?'bg-primary border-primary text-primary-foreground':'border-border hover:border-primary text-muted-foreground')}>{settings.allArticlesLabel}</Link>
          {categories.map(c=><Link prefetch={false} key={c.key} href={'/blog/category/'+c.slug} aria-current={category?.key===c.key?'page':undefined} className={'px-4 py-2 rounded-full border text-sm transition-colors '+(category?.key===c.key?'bg-primary border-primary text-primary-foreground':'border-border hover:border-primary text-muted-foreground')}>{c.name}</Link>)}
        </nav>}
        {!posts.length?<p className="py-12 text-center text-muted-foreground" role="status">{plainText(settings.emptyMessage)}</p>:<div data-blog-grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-6 sm:gap-8">
          {posts.map(post=>{
            const href='/blog/'+post.slug,reviewer=post.reviewer,summary=plainText(post.short_summary??post.excerpt).trim()||plainText(post.meta_description);
            return <article data-blog-card key={post.id} className="group h-full flex flex-col min-w-0 rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <Link href={href} className="block aspect-video overflow-hidden bg-secondary" aria-label={post.title}>
                <SafeImage src={post.image_url||post.imageUrl} alt={post.image_alt||post.title} width={1920} height={1080} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
              </Link>
              <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
                {!!post.categoryProfiles?.length&&<div className="flex flex-wrap gap-2 mb-3">{post.categoryProfiles.map(c=><Link key={c.key} href={'/blog/category/'+c.slug} className="text-xs text-primary bg-primary/5 rounded-full px-2.5 py-1">{c.name}</Link>)}</div>}
                <h3 className="text-lg sm:text-xl font-bold leading-snug line-clamp-3 break-words"><Link href={href} className="hover:text-primary transition-colors">{plainText(post.title)}</Link></h3>
                <p className="mt-3 text-xs text-muted-foreground">{settings.publishedLabel} <time dateTime={post.published_at||post.created_at}>{listingDate(post.published_at||post.created_at)}</time></p>
                {settings.showReviewer&&reviewer?.name&&<p data-reviewer className="text-xs text-muted-foreground mt-2 break-words">{settings.reviewerLabel} {reviewer.profileUrl?<a href={reviewer.profileUrl} rel="noopener noreferrer" target="_blank" className="text-primary hover:underline">{reviewer.name}</a>:<span>{reviewer.name}</span>}{reviewer.role?' - '+reviewer.role:''}</p>}
                <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-6 line-clamp-4 break-words">{summary.slice(0,200)}</p>
                <Link href={href} className="text-sm font-semibold text-primary hover:underline mt-auto pt-2 inline-flex items-center gap-2 self-start">{settings.continueReadingText}<span aria-hidden>→</span></Link>
              </div>
            </article>;
          })}
        </div>}
        {totalPages>1&&<nav aria-label="Blog pagination" className="flex flex-wrap justify-center items-center gap-2 mt-12 text-sm">
          <Link prefetch={false} className="border border-border rounded-lg px-3 py-2 hover:border-primary" href={pageHref(1)}>First</Link>
          {page>1?<Link prefetch={false} className="border border-border rounded-lg px-3 py-2 hover:border-primary" href={pageHref(page-1)} rel="prev">Prev</Link>:<span className="px-3 py-2 text-muted-foreground" aria-disabled="true">Prev</span>}
          {paginationItems(page,totalPages).map(item=>typeof item==='string'?<span key={item} className="px-1" aria-hidden>…</span>:<Link prefetch={false} key={item} href={pageHref(item)} aria-current={page===item?'page':undefined} aria-label={'Page '+item} className={'px-3 py-2 rounded-lg border '+(page===item?'bg-primary text-primary-foreground border-primary':'border-border hover:border-primary')}>{item}</Link>)}
          {page<totalPages?<Link prefetch={false} className="border border-border rounded-lg px-3 py-2 hover:border-primary" href={pageHref(page+1)} rel="next">Next</Link>:<span className="px-3 py-2 text-muted-foreground" aria-disabled="true">Next</span>}
          <Link prefetch={false} className="border border-border rounded-lg px-3 py-2 hover:border-primary" href={pageHref(totalPages)}>Last</Link>
        </nav>}
      </div>
    </section>
  </>;
}
