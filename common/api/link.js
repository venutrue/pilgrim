import Q from 'bluebird-q';
import read from 'node-readability';
import qs from 'qs';
import { map, filter } from 'lodash';
import parseLinks from '../lib/parse_links';
import cleanRulers from '../lib/clean_rulers';
import embed from 'embed-video';
import { parse } from 'url';

export default (url) => {
  return Q.promise((resolve, reject) => {
    read(url, {
      cleanRulers: cleanRulers,
      maxRedirects: 40,
      jar: true,
      headers: {
        'User-Agent': 'request'
      }
    }, (err, article, res) => {
      if(err){
        return reject(err);
      }
      parseLinks(article.content).then((hrefs) => {
        let html = '';
        if(url.indexOf('youtube') > 0 || url.indexOf('vimeo') > 0){
          html = embed(url) + article.content;
        }else{
          html = article.content;
        }
        resolve({
          html: html,
          title: article.title,
          hrefs: hrefs,
          url: url,
          host: parse(url).hostname
        });
        return article.close();
      }).catch((err) =>{
        console.log('error parsing', err);
        return reject(err)
      });
    });
  });
}
