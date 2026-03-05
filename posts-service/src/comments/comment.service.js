import Comment from "./comment.model.js";

// Crear comentario
export const createCommentRecord = async ({ postId, text, authorId }) => {
  const comment = new Comment({ postId, text, authorId });
  await comment.save();
  return comment;
};

// Listar comentarios de una publicación
export const fetchCommentsByPost = async (postId) => {
  return Comment.find({ postId, isActive: true })
    .sort({ createdAt: -1 })
    .populate("authorId", "username email");
};

// Actualizar comentario (solo autor)
export const updateCommentRecord = async ({ id, text, authorId }) => {
  const comment = await Comment.findById(id);
  if (!comment) return null;

  // Verificar que es el autor
  if (comment.authorId !== authorId) {
    throw new Error('No tienes permisos para editar este comentario');
  }

  comment.text = text;
  await comment.save();
  return comment;
};

// Eliminar comentario (solo autor)
export const deleteCommentRecord = async ({ id, authorId }) => {
  const comment = await Comment.findById(id);
  if (!comment) return null;

  // Verificar que es el autor
  if (comment.authorId !== authorId) {
    throw new Error('No tienes permisos para eliminar este comentario');
  }

  await comment.deleteOne();
  return comment;
};
