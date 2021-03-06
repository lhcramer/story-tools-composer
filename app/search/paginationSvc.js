function paginationSvc(queryService) {
  let svc;

  svc.paginate = (response, view, scope) => {
    const meta = response.data.meta;

    // pagination info under meta property is only available on content (resource base API)
    if (meta.current_page != undefined) {
      apiPaginate(response, view);
    } else {
      // do the django paginator logic on the front end
      if (scope.query.offset === 0 || scope.query.offset < meta.total_count) {
        view.totalCount = meta.total_count;
        manualPaginate(view, scope);
      } else {
        // throw error and reset if offset is greater than total results
        console.log(
          "Offset was higher than total count. Setting offset to 0 and searching again."
        );
        queryService.resetOffset(scope);
      }
    }
  };

  // given an api response and a controller view, this sets pagination and 'showing' values
  svc.apiPaginate = (response, view) => {
    view.totalCount = response.data.meta.total_count;
    view.currentPage = response.data.meta.current_page;
    view.numPages = response.data.meta.num_pages;

    view.startIndex = response.data.meta.start_index;
    view.endIndex = response.data.meta.end_index;
  };

  // given an api response that doesn't use django paginator, this sets pagination values
  // "page a of b"  "showing x - y of z results"
  svc.manualPaginate = (view, scope) => {
    const limit = scope.query.limit;
    const offset = scope.query.offset;
    const cards = scope.cards || view.cards;

    view.currentPage = Math.ceil(offset / limit) + 1;
    view.numPages = Math.ceil(view.totalCount / limit);

    view.startIndex = Number(offset) + 1;
    view.endIndex = Number(offset) + Number(cards.length);
  };

  svc.changePage = (view, scope) => {
    const limit = scope.query.limit;
    const page = view.currentPage - 1; //stepback to a 0 index

    const nextOffset = limit * page;
    // next offset will be a multiple of the current limit
    scope.query.offset = nextOffset;

    // update result cards
    // some controllers will have the search method
    // on the view model and some on the scope
    const search = scope.search || view.search;
    search();
  };

  svc.up = (view, scope) => () => {
    if (view.currentPage < view.numPages) {
      view.currentPage += 1;
      changePage(view, scope);
    }
  };

  svc.down = (view, scope) => () => {
    if (view.currentPage > 1) {
      view.currentPage -= 1;
      changePage(view, scope);
    }
  };

  return svc;
}

module.exports = paginationSvc;
