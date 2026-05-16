import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments.js';
import { relativeTime } from '../utils/relativeTime.js';

export default function CommentSection({ taskId }) {
  const [body, setBody] = useState('');
  const { user } = useAuth();
  const { data: comments = [] } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  const submit = (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    createComment.mutate({ body }, { onSuccess: () => setBody('') });
  };

  return (
    <section className="panel">
      <div className="section-head">
        <h2>Comments</h2>
      </div>
      <form className="comment-form" onSubmit={submit}>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a comment..." />
        <button className="btn primary" type="submit">Comment</button>
      </form>
      <div className="comments-list">
        {comments.map((comment) => (
          <article key={comment.id} className="comment">
            <span className="avatar">{(comment.author_username || 'U').slice(0, 2).toUpperCase()}</span>
            <div>
              <div className="comment-head">
                <strong>{comment.author_username || 'Unknown'}</strong>
                <span>{relativeTime(comment.created_at)}</span>
                {(comment.author_id === user?.id || user?.role === 'admin') && (
                  <button onClick={() => deleteComment.mutate(comment.id)}>Delete</button>
                )}
              </div>
              <p>{comment.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
