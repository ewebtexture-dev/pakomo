import PostEditor from '@/components/admin/PostEditor';
export default async function EditBlog({params}){return <PostEditor id={(await params).id} />;}
