import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";
import { useSelector } from "react-redux";
import { selectPostById } from "./postsSlice";
import { Link } from "react-router-dom";
import { truncateAtNthWord } from "../../lib/stringUtils";
import React from "react";

const PostsExcerpt = ({ postId }) => {
 const post = useSelector(state => selectPostById(state, postId))

 return (
  <article>
   <h2>{post.title}</h2>

   <p className="excerpt">{truncateAtNthWord(post.body, 10)}</p>

   <p className="postCredit">
    <Link to={`post/${post.id}`}>View Post</Link>
    <PostAuthor userId={post.userId}></PostAuthor>
    <TimeAgo timestamp={post.date}></TimeAgo>
   </p>

   <ReactionButtons post={post}></ReactionButtons>
  </article>
 )
}

export default PostsExcerpt
