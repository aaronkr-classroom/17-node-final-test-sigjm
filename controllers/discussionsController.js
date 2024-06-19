// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion"),
    getDiscussionParams = (body, user) => {
      return {
        title: body.title,
        description: body.description,
        author: user,
        category: body.category,
        tags: body.tags,
      };
    };

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */
  // 1. new: 액션
  new: (req, res) => {
    res.render("discussions/new");
  },
  // 2. create: 액션
  create: (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user);
    let newDiscussion = new Discussion(discussionParams);

    newDiscussion.save()
        .then(discussion => {
          res.locals.redirect = `/discussions/${discussion._id}`;
          res.locals.discussion = discussion;
          next();
        })
        .catch(error => {
          console.log(`Error saving discussion: ${error.message}`);
          next(error);
        });
  },
  // 3. redirectView: 액션
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */
  /**
   * ------------------------------------
   * ALL records / 모든 레코드
   * ------------------------------------
   */
  // 4. index: 액션
  index: (req, res, next) => {
    Discussion.find()
        .populate("author")
        .exec()
        .then(discussions => {
          res.locals.discussions = discussions;
          next();
        })
        .catch(error => {
          console.log(`Error fetching discussions: ${error.message}`);
          next(error);
        });
  },
  // 5. indexView: 엑션
  indexView: (req, res) => {
    res.render("discussions/index");
  },
  /**
   * ------------------------------------
   * SINGLE record / 단일 레코드
   * ------------------------------------
   */
  // 6. show: 액션
  show: (req, res, next) => {
    let discussionID = req.params.id;
    Discussion.findById(discussionID)
        .populate("author")
        .populate("comments")
        .then(discussion => {
          discussion.views++;
          return discussion.save();
        })
        .then(discussion => {
          res.locals.discussion = discussion;
          next();
        })
        .catch(error => {
          console.log(`Error fetching discussion by ID: ${error.message}`);
          next(error);
        });
  },
  // 7. showView: 액션
  showView: (req, res) => {
    res.render("discussions/show");
  },
  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */
  // 8. edit: 액션
  edit: (req, res, next) => {
    let discussionID = req.params.id;
    Discussion.findById(discussionID)
        .populate("author")
        .populate("comments")
        .then(discussion => {
          res.render("discussions/edit", {
            discussion: discussion
          });
        })
        .catch(error => {
          console.log(`Error fetching discussion by ID: ${error.message}`);
          next(error);
        });
  },
  // 9. update: 액션
  update: (req, res, next) => {
    let discussionID = req.params.id;
    let discussionParams = getDiscussionParams(req.body, req.user);

    Discussion.findByIdAndUpdate(discussionID, {
      $set: discussionParams
    })
        .populate("author")
        .then(discussion => {
          res.locals.redirect = `/discussions/${discussionID}`;
          res.locals.discussion = discussion;
          next();
        })
        .catch(error => {
          console.log(`Error updating discussion by ID: ${error.message}`);
          next(error);
        });
  },
  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */
  // 10. delete: 액션
  delete: (req, res, next) => {
    let discussionID = req.params.id;
    Discussion.findByIdAndRemove(discussionID)
        .then(() => {
          res.locals.redirect = "/discussions";
          next();
        })
        .catch(error => {
          console.log(`Error deleting discussion by ID: ${error.message}`);
          next(error);
        });
  }
};