import AuthorEditor from '@/components/admin/AuthorEditor';
export default async function EditAuthor({params}){return <AuthorEditor id={(await params).id} />;}
