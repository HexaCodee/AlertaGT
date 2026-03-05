import {
  fetchCommentsByPost,
  createCommentRecord,
  updateCommentRecord,
  deleteCommentRecord,
} from './comment.service.js';

// Crear comentario
export const createComment = async (req, res) => {
  try {
    const comment = await createCommentRecord({
      postId: req.body.postId,
      text: req.body.text,
      authorId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: comment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el comentario',
      error: err.message,
    });
  }
};

// Listar comentarios por publicación
export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await fetchCommentsByPost(postId);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los comentarios',
      error: err.message,
    });
  }
};

// Actualizar comentario (solo autor)
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await updateCommentRecord({
      id,
      text: req.body.text,
      authorId: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado o no tienes permisos',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: comment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el comentario',
      error: err.message,
    });
  }
};

// Eliminar comentario (solo autor)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await deleteCommentRecord({
      id,
      authorId: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado o no tienes permisos',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comentario eliminado exitosamente',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el comentario',
      error: err.message,
    });
  }
};