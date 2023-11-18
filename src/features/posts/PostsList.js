import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { selectAllPosts, getPostsStatus, getPostsError, fetchPosts } from "./postsSlice"
import PostsExcerpt from "./PostsExcerpt";

let isFirst = true;

const PostsList = () => {
 const dispatch = useDispatch();

 const posts = useSelector(selectAllPosts);
 const postsStatus = useSelector(getPostsStatus);
 const postsError = useSelector(getPostsError);

 useEffect(() => {
  if (postsStatus === 'idle' && isFirst) {
   dispatch(fetchPosts())

   isFirst = false;
  }
 }, [postsStatus])

 // ! with unwrap()
 // useEffect(() => {
 //  (async () => {
 //   try {
 //    if (postsStatus === 'idle' && isFirst) {
 //     await dispatch(fetchPosts()).unwrap()
 //    }
 //   } catch (err) {
 //    console.log(err)
 //   }
 //  })()

 //  isFirst = false;
 // }, [postsStatus])

 let content;
 if (postsStatus === 'loading') {
  content = <p>"Loading..."</p>;
 } else if (postsStatus === 'succeeded') {
  const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))
  content = orderedPosts.map(post => <PostsExcerpt key={post.id} post={post} />)
 } else if (postsStatus === 'failed') {
  content = <p>{postsError}</p>;
 }

 return (
  <section>
   <h2>Posts</h2>
   {content}
  </section>
 )
}

export default PostsList
