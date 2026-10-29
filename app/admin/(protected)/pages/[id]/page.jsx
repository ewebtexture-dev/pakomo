import ContentEditor from '@/components/admin/ContentEditor';
export default async function Page({params}){const {id}=await params;return <ContentEditor id={id} kind="page" base="/admin/pages"/>;}
