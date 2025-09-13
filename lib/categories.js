import request from './utils/request.js';
import { BASE_URL } from './constants.js';

const PLAYSTORE_URL = `${BASE_URL}/store/apps`;
const CATEGORY_URL_PREFIX = '/store/apps/category/';

function categories (opts) {
  opts = Object.assign({}, opts);

  return new Promise(function (resolve, reject) {
    const options = Object.assign(
      {
        url: PLAYSTORE_URL
      },
      opts.requestOptions
    );

    request(options, opts.throttle)
      .then(extractCategories)
      .then(resolve)
      .catch(reject);
  });
}

function extractCategories (html) {
  // Extract category URLs using regex instead of cheerio
  const linkRegex = /<a[^>]+href="([^"]*)"[^>]*>/g;
  const categoryIds = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.startsWith(CATEGORY_URL_PREFIX) && !url.includes('?age=')) {
      const categoryId = url.substr(CATEGORY_URL_PREFIX.length);
      if (categoryId && !categoryIds.includes(categoryId)) {
        categoryIds.push(categoryId);
      }
    }
  }
  
  categoryIds.push('APPLICATION');
  return categoryIds;
}

export default categories;
