import FilmCardView from '../view/film-card-view.js';
import DetailedInfoView from '../view/detailed-info-view.js';
import {render, RenderPosition, replace, remove} from '../utils/render.js';
import {FilterType, UpdateType} from '../const.js';
import {isCtrlEnterEvent, isEscEvent} from '../utils/common';

export const State = {
  SAVING: 'SAVING',
  DELETING: 'DELETING',
  ABORTING: 'ABORTING',
};

const body = document.querySelector('body');
const siteFooterElement = document.querySelector('.footer');

export default class FilmPresenter {
  #filmBox = null;
  #changeData = null;
  #filmComponent = null;
  #detailedFilmComponent = null;
  #commentsModel = null;
  #changeComment = null;
  #film = null;
  #isCommentsLoaded = false;

  _callback = {};

  constructor(filmBox, changeData, commentsModel, changeComment) {
    this.#filmBox = filmBox;
    this.#changeData = changeData;
    this.#commentsModel = commentsModel;
    this.#changeComment = changeComment;
  }

  init = (film) => {
    this.#film = film;

    const prevFilmComponent = this.#filmComponent;

    this.#filmComponent = new FilmCardView(film);
    this.#filmComponent.setPopupClickHandler(this.#handleCardClick);
    this.#filmComponent.setAddToFilterClickHandler(this.#handleAddToFilterClick);

    if (prevFilmComponent === null) {
      render(this.#filmBox, this.#filmComponent, RenderPosition.BEFOREEND);
      return;
    }

    replace(this.#filmComponent, prevFilmComponent);
    remove(prevFilmComponent);
  }

  destroy = () => {
    if (this.#detailedFilmComponent) {
      this.#detailedFilmComponent.saveScroll();
    }

    remove(this.#filmComponent);
  }

  handleLoadedComment() {
    this.#isCommentsLoaded = true;
  }

  setCardClick = (callback) => {
    this._callback.cardClick =  callback;
  }

  setCardClose = (callback) => {
    this._callback.cardClose =  callback;
  }

  #handleCardClick = () => {
    this._callback.cardClick();
  }

  showPopup = () => {
    const prevDetailedFilmComponent = this.#detailedFilmComponent;
    let filmComments = [];
    if (!this.#isCommentsLoaded) {
      this.#commentsModel.loadComments(this.#film.id);
    } else {
      filmComments = this.#commentsModel.getComments(this.#film.id);
    }

    this.#detailedFilmComponent = new DetailedInfoView(this.#film, filmComments);

    this.#detailedFilmComponent.setClosePopupClickHandler(this.#handleClosePopup);
    this.#detailedFilmComponent.setAddToFilterClickHandler(this.#handleAddToFilterClick);
    this.#detailedFilmComponent.setCommentActionHandler(this.#handlerCommentAction);

    render(siteFooterElement, this.#detailedFilmComponent, RenderPosition.AFTEREND);
    body.classList.add('hide-overflow');

    if (prevDetailedFilmComponent === null) {
      document.addEventListener('keydown', this.#escKeyDownHandler);
      document.addEventListener('keydown', this.#ctrEnterDownHandler);
      return;
    }

    replace(this.#detailedFilmComponent, prevDetailedFilmComponent);
    this.#detailedFilmComponent.setScroll(prevDetailedFilmComponent.scrollOptions);

    remove(prevDetailedFilmComponent);
  }

  #handleClosePopup = () => {
    this.closePopup();
    this._callback.cardClose();
  }

  closePopup = () => {
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    document.removeEventListener('keydown', this.#ctrEnterDownHandler);
    body.classList.remove('hide-overflow');

    if (this.#detailedFilmComponent !== null) {
      remove(this.#detailedFilmComponent);
      this.#detailedFilmComponent = null;
    }
  }

  #escKeyDownHandler = (evt) => {
    if (isEscEvent(evt)) {
      evt.preventDefault();
      this.#detailedFilmComponent.reset(this.#film);
      this.closePopup();
      this._callback.cardClose();
    }
  }

  #handleAddToFilterClick = (filterType) => {

    switch (filterType) {
      case FilterType.FAVOURITES:
        this.#changeData(
          UpdateType.MINOR,
          {...this.#film, isFavourite: !this.#film.isFavourite},
        );
        break;
      case FilterType.WATCHED:
        this.#changeData(
          UpdateType.MINOR,
          {...this.#film, isWatched: !this.#film.isWatched},
        );
        break;
      case FilterType.WATCHLIST:
        this.#changeData(
          UpdateType.MINOR,
          {...this.#film, isInWatchlist: !this.#film.isInWatchlist},
        );
        break;
    }
  }

  #handlerCommentAction = (type, comment, filmId) => {
    this.#changeComment(type, UpdateType.MINOR, {comment: comment, filmId: filmId});
  }

  #ctrEnterDownHandler = (evt) => {
    if (isCtrlEnterEvent(evt)) {
      evt.preventDefault(evt);
      this.#detailedFilmComponent.addCommentHandler();
    }
  }

  setViewState = (state, updateId = null) => {
    const resetFormState = () => {
      this.#detailedFilmComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
        deletingCommentId: null,
      });
    };

    switch (state) {
      case State.SAVING:
        this.#detailedFilmComponent.updateData({
          isDisabled: true,
          isSaving: true,
        });
        break;
      case State.DELETING:
        this.#detailedFilmComponent.updateData({
          isDisabled: true,
          isDeleting: true,
          deletingCommentId: updateId,
        });
        break;
      case State.ABORTING:
        this.#detailedFilmComponent.shakeNewComment(resetFormState);
        break;
    }
  }

  setSaving = () => {
    this.#detailedFilmComponent.updateData({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAbortingNewComment = () => {
    const resetFormState = () => {
      this.#detailedFilmComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
        deletingCommentId: null,
      });
    };

    this.#detailedFilmComponent.shakeNewComment(resetFormState);
  }

  setAbortingDeleteComment = (commentId) => {
    const resetFormState = () => {
      this.#detailedFilmComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
        deletingCommentId: null,
      });
    };

    this.#detailedFilmComponent.shakeComment(resetFormState, commentId);
  }
}
