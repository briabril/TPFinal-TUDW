"use client";
import { Comment } from "../../types/comment";
import { useSocket } from "@/hooks/useSocket";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { Typography, Box, CircularProgress, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import { CommentFormData } from "../../schemas/commentSchema";
import api from "../../api/index";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface CommentProps {
  postId: string | number;
}

const Comments: React.FC<CommentProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const authorId = user?.id;

  const socketRef = useSocket(); 

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Comment[]>(`/comments/post/${postId}`);
      setComments(data);
    } catch {
      toast.error("Error al cargar comentarios");
    } finally {
      setLoading(false);
    }
  };

  function addCommentToTree(tree: Comment[], newComment: Comment): Comment[] {
    if (!newComment.parent_id) {
      return [...tree, { ...newComment, children: [] }];
    }

    const addRecursively = (nodes: Comment[]): Comment[] =>
      nodes.map((node) => {
        if (node.id === newComment.parent_id) {
          return {
            ...node,
            children: [...(node.children || []), { ...newComment, children: [] }],
          };
        }
        return {
          ...node,
          children: addRecursively(node.children || []),
        };
      });

    return addRecursively(tree);
  }

  function updateCommentInTree(tree: Comment[], updated: Comment): Comment[] {
    const rec = (nodes: Comment[]): Comment[] =>
      nodes.map((n) => {
        if (n.id === updated.id) {
          return { ...n, text: updated.text };
        }
        return { ...n, children: rec(n.children || []) };
      });

    return rec(tree);
  }

  function deleteCommentFromTree(tree: Comment[], id: string | number): Comment[] {
    const rec = (nodes: Comment[]): Comment[] =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, children: rec(n.children || []) }));

    return rec(tree);
  }

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const newEvent = `new-comment-${postId}`;
    const updateEvent = `update-comment-${postId}`;
    const deleteEvent = `delete-comment-${postId}`;

    const handleNew = (c: Comment) => {
      setComments((prev) => addCommentToTree(prev, c));
    };

    const handleUpd = (c: Comment) => {
      setComments((prev) => updateCommentInTree(prev, c));
    };

    const handleDel = (id: string | number) => {
      setComments((prev) => deleteCommentFromTree(prev, id));
    };

    socket.on(newEvent, handleNew);
    socket.on(updateEvent, handleUpd);
    socket.on(deleteEvent, handleDel);

    return () => {
      socket.off(newEvent, handleNew);
      socket.off(updateEvent, handleUpd);
      socket.off(deleteEvent, handleDel);
    };
  }, [postId, socketRef.current]);
  const handleSubmit = async (data: CommentFormData, parentId?: string | number | null) => {
    try {
      const res = await api.post(
        `/comments/post/${postId}`,
        {
          author_id: authorId,
          text: data.text,
          parent_id: parentId || null,
        },
        { withCredentials: true }
      );

      const created = res.data as Comment;

      // created.author_username = created.author_username || user?.username || "Usuario";
      // created.author_avatar = created.author_avatar || user?.profile_picture_url || null;

      // setComments((prev) => addCommentToTree(prev, created));

      return created;
    } catch {
      toast.error("Error al publicar comentario");
    }
  };

  return (
    <Box sx={{ mt: 4, borderTop: "1px solid #e0e0e0" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Comentarios
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CommentForm postId={postId} onSubmit={handleSubmit} />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No hay comentarios todavía.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {comments.map((c, index) => (
            <Box key={c.id}>
              <CommentItem
                comment={c}
                onReply={handleSubmit}
                onEdit={(u) => setComments((prev) => updateCommentInTree(prev, u))}
                onDelete={(id) => setComments((prev) => deleteCommentFromTree(prev, id))}
              />
              {index !== comments.length - 1 && <Divider sx={{ my: 1, opacity: 0.5 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Comments;
