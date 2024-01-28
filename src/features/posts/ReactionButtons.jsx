import { useDispatch } from "react-redux";
import { addReaction } from "./postsSlice";

const reactionEmoji = {
 thumbsUp: '👍',
 wow: '😮',
 heart: '❤️',
 rocket: '🚀',
 coffee: '☕'
}

const ReactionButtons = ({ post }) => {
 const dispatch = useDispatch()

 return (
  <div>
   {Object.entries(reactionEmoji).map(([name, emoji]) => (
    <button key={name} type="button" className="reactionButton" onClick={() => dispatch(addReaction({ postId: post.id, reaction: name }))}>
     {emoji} {post.reactions[name]}
    </button>
   ))}
  </div>
 )
}
export default ReactionButtons