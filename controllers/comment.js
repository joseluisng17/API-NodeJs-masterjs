'use strict'

var Topic = require('../models/topic');
var validator = require('validator');

var controller = {

    add: function(req, res) {

        // Recoger el id del topic de la url
        var topicId = req.params.topicId;

        // find por id del topic
        Topic.findById(topicId).exec((err, topic) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "error en la petición"
                });
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: "no existe el tema"
                });
            }

            // Comprobar objeto usuario y validar datos
            if (req.body.content) {
                // validar datos
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch (err) {
                    return res.status(200).send({
                        message: 'No has comentado nada'
                    });
                }

                if (validate_content) {

                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,
                    }

                    // En la propiedad comments del objeto resultante hace un push
                    topic.comments.push(comment);

                    // Guardar el topic completo
                    topic.save((err) => {

                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: "error al guardar el commentario"
                            });
                        }

                        // Devolver resultado
                        return res.status(200).send({
                            status: 'success',
                            topic
                        });

                    });

                } else {
                    return res.status(200).send({
                        message: 'No se han validado los datos del commentario'
                    });
                }
            }

        });

    },

    update: function(req, res) {

        // Conseguir id de comentario que llega de la url
        var commentId = req.params.commentId;

        // Recoger datos y validar
        var params = req.body;

        // validar datos
        try {
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                message: 'No has comentado nada'
            });
        }

        if (validate_content) {
            // Find and update
            Topic.findOneAndUpdate({ "comments._id": commentId }, { "$set": { "comments.$.content": params.content } }, { new: true },
                (err, topicUpdate) => {

                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: "error en la petición"
                        });
                    }
                    if (!topicUpdate) {
                        return res.status(404).send({
                            status: 'error',
                            message: "no existe el tema"
                        });
                    }

                    //Devolver datos
                    return res.status(200).send({
                        status: "success",
                        topic: topicUpdate
                    });
                });
        }
    },

    delete: function(req, res) {

        // Sacar el id del topic y del comentario a borrar
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // Buscar el topic
        Topic.findById(topicId, (err, topic) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "error en la petición"
                });
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: "no existe el tema"
                });
            }

            // Seleccionar el subdocumento (comentario)
            var comment = topic.comments.id(commentId);

            // Borrar el comentario
            if (comment) {
                comment.remove();

                // Guardar el topic
                topic.save((err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: "error en la petición"
                        });
                    }

                    // Devolver un resultado
                    return res.status(200).send({
                        status: 'success',
                        topic
                    });

                });

            } else {
                return res.status(200).send({
                    status: 'error',
                    message: "No existe el comentario"
                });
            }

        });

    }

};

module.exports = controller;