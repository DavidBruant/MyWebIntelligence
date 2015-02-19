"use strict";

var Set = require('es6-set');
var Map = require('es6-map');
var Promise = require('es6-promise').Promise;

// The fetch module takes care of redirects, per-domain throttling all that
var fetch = require('./fetch');
var extractEffectiveDocument = require('./extractEffectiveDocument');

/*
interface EffectiveDocument{
    html: string // stipped HTML containing only the useful content
    title: string // <title> or <h1>
    meta: Map<string, string>
    links: Set<string>
}

// ignoring intermediate redirects
interface FetchedDocument{
    originalURL: string
    URLAfterRedirects : string
    html: string
}
*/


/*
    urls: Set<string>
    originalWords: Set<string>
    
    @return Promise<CrawlResult> which is sort of a graph
*/
module.exports = function(initialUrls, originalWords){
    console.log('crawl call', initialUrls.size, originalWords);
    
    var todo = new Set(initialUrls); // clone
    var doing = new Set();
    var done = new Set();
    var results = new Map(); // Map<urlAfterRedirect, result>()
    var redirects = new Map(); 
    
    function approve(fetchedDocument){
        // TODO
        return false;
    }
    
    function crawl(){
        console.log('internal crawl', todo.size, doing.size, done.size);
        return Promise.all(todo._toArray().map(function(u){
            todo.delete(u)
            doing.add(u);

            return fetch(u)
                .then(function(fetchedDocument){
                    if(fetchedDocument.originalURL !== fetchedDocument.URLAfterRedirects){
                        redirects.set(fetchedDocument.originalURL, fetchedDocument.URLAfterRedirects);
                    }
                
                    return extractEffectiveDocument(fetchedDocument.URLAfterRedirects)
                        .then(function(effectiveDocument){
                            doing.delete(u);
                            results.set(fetchedDocument.URLAfterRedirects, effectiveDocument);
                            done.add(u);
                        
                            //console.log('yo', fetchedDocument.URLAfterRedirects, effectiveDocument); 

                            if(approve(fetchedDocument)){
                                effectiveDocument.links.forEach(function(u){
                                    if(!doing.has(u) && !done.has(u) && !results.has(u))
                                        todo.add(u);
                                });
                            }
                        });
                })
                .then(function(){
                    return todo.size >= 1 ? crawl() : undefined;
                })
                .catch(function(err){
                    console.error('error while exploring the web', u, err)
                });

        }));
    }
    
    return crawl().then(function(){
        return {
            nodes: results,
            redirects: redirects
        }
    });
};