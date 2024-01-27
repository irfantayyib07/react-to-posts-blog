import { useSelector, useDispatch } from "react-redux";
// import { useEffect } from "react";
// import { selectAllPosts, getPostsStatus, getPostsError, fetchPosts } from "./postsSlice"
import { selectPostIds, getPostsStatus, getPostsError, fetchPosts } from "./postsSlice"
import PostsExcerpt from "./PostsExcerpt";

// let isFirst = true;

const PostsList = () => {
 // const dispatch = useDispatch();

 const orderedPostIds = useSelector(selectPostIds);
 const postsStatus = useSelector(getPostsStatus);
 const postsError = useSelector(getPostsError);

 // useEffect(() => {
 //  if (postsStatus === 'idle') {
 //   if (isFirst) dispatch(fetchPosts())

 //   isFirst = false;
 //  }
 // }, [postsStatus, dispatch])

 let content;
 if (postsStatus === 'loading') {
  content = <p>"Loading..."</p>;
 } else if (postsStatus === 'succeeded') {
  content = orderedPostIds.map(postId => <PostsExcerpt key={postId} postId={postId} />)
 } else if (postsStatus === 'failed') {
  content = <p>{postsError}</p>;
 }

 return (
  <section>
   {content}
  </section>
 )
}

export default PostsList
