import he from 'he';
import dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import {humanizeFilmReleaseDetailedDate} from '../utils/common.js';
import SmartView from './smart-view.js';
import {CommentAction, FilterType} from '../const.js';
import {getRuntime} from '../utils/film.js';
const SHAKE_ANIMATION_TIMEOUT = 600;

dayjs.extend(relativeTime);

const createCommentItem = (comment, isDeleting, isDisabled, deletingCommentId) => {

  const {
    id,
    text,
    emoji,
    author,
    date,
  } = comment;

  return (
    `<li id="a${id}" class="film-details__comment">
      <span class="film-details__comment-emoji">
        <img src="./images/emoji/${emoji}.png" width="55" height="55" alt="emoji-smile">
      </span>
      <div>
        <p class="film-details__comment-text">${text}</p>
        <p class="film-details__comment-info">
          <span class="film-details__comment-author">${author}</span>
          <span class="film-details__comment-day">${dayjs(date).fromNow()}</span>
          <button class="film-details__comment-delete" 
                  data-comment-id="${id}" 
                  ${isDisabled ? 'disabled' : ''}>
            ${isDeleting && id === deletingCommentId ? 'Deleting...' : 'Delete'}
          </button>
        </p>
      </div>
    </li>`
  );
};

const createCommentsTemplate = (comments, isDeleting, isDisabled, deletingCommentId) =>
  comments.length ? comments.map((comment) => createCommentItem(comment, isDeleting, isDisabled, deletingCommentId)).join('') : '';

const createEmojiImgTemplate = (emoji) => emoji ? `<img src="./images/emoji/${emoji}.png" width="70" height="70" alt="emoji-${emoji}">` : '';

const createDetailedInfoTemplate = (film, comments) => {

  const {
    title,
    titleOriginal,
    poster,
    rating,
    released,
    runtime,
    genre,
    description,
    isInWatchlist,
    isWatched,
    isFavourite,
    director,
    writers,
    actors,
    country,
    ageRating,
    newCommentEmoji,
    newCommentText,
    isDisabled,
    isSaving,
    isDeleting,
    deletingCommentId,
  } = film;

  const detailedReleaseDate = humanizeFilmReleaseDetailedDate(released);
  const activeClass = 'film-details__control-button--active';
  const favouriteClassName = isFavourite ? activeClass : '';
  const watchedClassName = isWatched ? activeClass : '';
  const watchListClassName = isInWatchlist ? activeClass : '';
  const newEmojiImg = createEmojiImgTemplate(newCommentEmoji);

  return (
    `<section class="film-details">
      <form class="film-details__inner" action="" method="get">
        <div class="film-details__top-container">
          <div class="film-details__close">
            <button class="film-details__close-btn" type="button">close</button>
          </div>
          <div class="film-details__info-wrap">
            <div class="film-details__poster">
              <img class="film-details__poster-img" src="${poster}" alt="">
              <p class="film-details__age">${ageRating}+</p>
            </div>

            <div class="film-details__info">
              <div class="film-details__info-head">
                <div class="film-details__title-wrap">
                    <h3 class="film-details__title">${title}</h3>
                    <p class="film-details__title-original">Original: ${titleOriginal}</p>
                </div>

                <div class="film-details__rating">
                  <p class="film-details__total-rating">${rating}</p>
                </div>
              </div>

              <table class="film-details__table">
                <tr class="film-details__row">
                  <td class="film-details__term">Director</td>
                  <td class="film-details__cell">${director}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Writers</td>
                  <td class="film-details__cell">${writers}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Actors</td>
                  <td class="film-details__cell">${actors.join(', ')}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Release Date</td>
                  <td class="film-details__cell">${detailedReleaseDate}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Runtime</td>
                  <td class="film-details__cell">${getRuntime(runtime).hours}h ${getRuntime(runtime).minutes}m</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Country</td>
                  <td class="film-details__cell">${country}</td>
                </tr>
                <tr class="film-details__row">
                  <td class="film-details__term">Genre${genre.length > 1 ? 's' : ''}</td>
                  <td class="film-details__cell">${genre.join(', ')}</td>
                </tr>
              </table>

              <p class="film-details__film-description">${description}</p>
            </div>
          </div>

          <section class="film-details__controls">
            <button type="button" class="film-details__control-button ${watchListClassName} film-details__control-button--watchlist" id="watchlist" name="watchlist" data-filter-type="${FilterType.WATCHLIST}">Add to watchlist</button>
            <button type="button" class="film-details__control-button ${watchedClassName} film-details__control-button--watched" id="watched" name="watched" data-filter-type="${FilterType.WATCHED}">Already watched</button>
            <button type="button" class="film-details__control-button ${favouriteClassName} film-details__control-button--favorite" id="favorite" name="favorite" data-filter-type="${FilterType.FAVOURITES}">Add to favorites</button>
          </section>
        </div>

        <div class="film-details__bottom-container">
          <section class="film-details__comments-wrap">
            <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${comments.length}</span></h3>
            <ul class="film-details__comments-list">${createCommentsTemplate(comments, isDeleting, isDisabled, deletingCommentId)}</ul>
            <div class="film-details__new-comment">
              <div class="film-details__add-emoji-label">${newEmojiImg}</div>

              <label class="film-details__comment-label">
                <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment">${he.encode(newCommentText)}</textarea>
              </label>

              <div class="film-details__emoji-list">
                <input class="film-details__emoji-item visually-hidden" 
                      name="comment-emoji" ${isSaving ? 'disabled' : ''} type="radio" id="emoji-smile" value="smile">
                <label class="film-details__emoji-label" for="emoji-smile">
                  <img src="./images/emoji/smile.png" width="30" height="30" alt="emoji">
                </label>

                <input class="film-details__emoji-item visually-hidden" 
                      name="comment-emoji" ${isSaving ? 'disabled' : ''} type="radio" id="emoji-sleeping" value="sleeping">
                <label class="film-details__emoji-label" for="emoji-sleeping">
                  <img src="./images/emoji/sleeping.png" width="30" height="30" alt="emoji">
                </label>

                <input class="film-details__emoji-item visually-hidden" 
                      name="comment-emoji" ${isSaving ? 'disabled' : ''} type="radio" id="emoji-puke" value="puke">
                <label class="film-details__emoji-label" for="emoji-puke">
                  <img src="./images/emoji/puke.png" width="30" height="30" alt="emoji">
                </label>

                <input class="film-details__emoji-item visually-hidden" 
                      name="comment-emoji" ${isSaving ? 'disabled' : ''} type="radio" id="emoji-angry" value="angry">
                <label class="film-details__emoji-label" for="emoji-angry">
                  <img src="./images/emoji/angry.png" width="30" height="30" alt="emoji">
                </label>
              </div>
            </div>
          </section>
        </div>
      </form>
    </section>`
  );
};

export default class DetailedInfoView extends SmartView {
  #comments = [];

  constructor(film, comments) {
    super();
    this._data = DetailedInfoView.parseFilmToData(film);
    this.#comments = comments;
    this.#setInnerHandlers();
  }

  get template() {
    return createDetailedInfoTemplate(this._data, this.#comments);
  }

  setClosePopupClickHandler = (callback) => {
    this._callback.closePopup = callback;
    this.element.querySelector('.film-details__close-btn').addEventListener('click', this.#popupCloseHandler);
  }

  #popupCloseHandler = (evt) => {
    evt.preventDefault();
    this._callback.closePopup();
  }

  setAddToFilterClickHandler = (callback) => {
    this._callback.addToFilter = callback;
    this.element.querySelector('.film-details__controls').addEventListener('click', this.#cardControlBlockClickHandler);
  }

  #cardControlBlockClickHandler = (evt) => {
    if (evt.target.tagName !== 'BUTTON') {
      return;
    }

    evt.preventDefault();
    this._callback.addToFilter(evt.target.dataset.filterType);
  }

  setCommentActionHandler = (callback) => {
    this._callback.commentAction = callback;

    this.element.querySelectorAll('.film-details__comment-delete').forEach((button) => {
      button.addEventListener('click', this.#deleteCommentHandler);
    });
  }

  #deleteCommentHandler = (evt) => {
    evt.preventDefault();
    const commentId = evt.target.dataset.commentId;
    const index = this.#comments.findIndex((comment) => comment.id === commentId);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting comment');
    }
    this._callback.commentAction(CommentAction.DELETE, this.#comments[index], this._data.id);
  }

  addCommentHandler = () => {
    const newComment = {
      emotion: this._data.newCommentEmoji,
      comment: this._data.newCommentText,
    };

    this._callback.commentAction(CommentAction.ADD, newComment, this._data.id);
  }

  #emojiClickHandler = (evt) => {
    evt.preventDefault();
    this.updateData({newCommentEmoji: evt.target.value,});
  }

  #commentInputHandler = (evt) => {
    evt.preventDefault();
    this.updateData({
      newCommentText: evt.target.value,
    }, true);
  }

  #setInnerHandlers = () => {
    this.element.querySelector('.film-details__emoji-list').addEventListener('change', this.#emojiClickHandler);
    this.element.querySelector('.film-details__comment-input').addEventListener('input', this.#commentInputHandler);
  }

  restoreHandlers = () => {
    this.setClosePopupClickHandler(this._callback.closePopup);
    this.setAddToFilterClickHandler(this._callback.addToFilter);
    this.#setInnerHandlers();
    this.setCommentActionHandler(this._callback.commentAction);
  }

  static parseFilmToData = (film) => ({...film,
    newCommentText: '',
    newCommentEmoji: null,
    isDisabled: false,
    isSaving: false,
    isDeleting: false,
    deletingCommentId: null,
  });

  reset = (film) => {
    this.updateData(
      DetailedInfoView.parseFilmToData(film),
    );
  }

  shakeComment(callback, commentId) {
    this.element.querySelector(`#a${commentId}`).style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;
    setTimeout(() => {
      this.element.querySelector(`#a${commentId}`).style.animation = '';
      callback();
    }, SHAKE_ANIMATION_TIMEOUT);
  }

  shakeNewComment(callback) {
    this.element.querySelector('.film-details__new-comment').style.animation = `shake ${SHAKE_ANIMATION_TIMEOUT / 1000}s`;
    setTimeout(() => {
      this.element.querySelector('.film-details__new-comment').style.animation = '';
      callback();
    }, SHAKE_ANIMATION_TIMEOUT);
  }
}
