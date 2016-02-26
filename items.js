/*
 Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');


function ItemDAO(database) {
	"use strict";

	this.db = database;

	var categoriesAll = [];

	this.getCategories = function (callback) {
		"use strict";
		console.log('getCategories>>>>>>>>');
		/*
		 * TODO-lab1A
		 *
		 * LAB #1A:
		 * Create an aggregation query to return the total number of items in each category. The
		 * documents in the array output by your aggregation should contain fields for
		 * "_id" and "num". HINT: Test your mongodb query in the shell first before implementing
		 * it in JavaScript.
		 *
		 * Ensure categories are organized in alphabetical order before passing to the callback.
		 *
		 * Include a document for category "All" in the categories to pass to the callback. All
		 * should identify the total number of documents across all categories.
		 *
		 */
		var categories = [];

		this.db.collection("item").aggregate([
			{ $project: { _id: 1, category: 1 } },
			{ $group: { _id: "$category", num: { $sum: 1 } } },
			{ $sort: { _id: 1 } }
		]).toArray(function (err, docs) {
			categories = docs;

			var total = 0;

			docs.forEach(function (doc) {
				total = total + doc.num;
			});

			var category = {
				_id: "All",
				num: total
			};

			categories.unshift(category);
			//console.log(categories);
			categoriesAll = categories;
			//console.log('getCategories =>>>> categoriesAll: ' + JSON.stringify(categoriesAll));

			callback(categories);
		});
		// TODO-lab1A Replace all code above (in this method).
	}


	this.getItems = function (category, page, itemsPerPage, callback) {
		"use strict";

		/*
		 * TODO-lab1B
		 *
		 * LAB #1B:
		 * Create a query to select only the items that should be displayed for a particular
		 * page. For example, on the first page, only the first itemsPerPage should be displayed.
		 * Use limit() and skip() and the method parameters: page and itemsPerPage to identify
		 * the appropriate products. Pass these items to the callback function.
		 *
		 * Do NOT sort items.
		 *
		 */
		//console.log('getItems =>>>> category: ' + category + ', page: ' + page + ', itemsPerPage:' + itemsPerPage);

		if (category === 'All') {
			this.db.collection('item')
				.find({})
				.limit(itemsPerPage)
				.skip(page * itemsPerPage)
				.toArray(function (err, docs) {
					callback(docs);
				});
		} else {
			this.db.collection('item')
				.find({ "category": category })
				.limit(itemsPerPage)
				.skip(page * itemsPerPage)
				.toArray(function (err, docs) {
					callback(docs);
				});
		}
		// TODO-lab1B Replace all code above (in this method).
	};


	this.getNumItems = function (category, callback) {
		"use strict";

		var numItems = 0;

		/*
		 * TODO-lab1C
		 *
		 * LAB #1C: Write a query that determines the number of items in a category and pass the
		 * count to the callback function. The count is used in the mongomart application for
		 * pagination. The category is passed as a parameter to this method.
		 *
		 * See the route handler for the root path (i.e. "/") for an example of a call to the
		 * getNumItems() method.
		 *
		 */
		categoriesAll.forEach(function (doc) {
			if (doc._id === category) {
				numItems = doc.num;
				return;
			}
		});

		//console.log('getNumItem =>>> category: ' + category  + ', numItems: ' + numItems);

		callback(numItems);
	};


	this.searchItems = function (query, page, itemsPerPage, callback) {
		"use strict";

		//console.log('searchItems =>>> query: ' + query + ', page: ' + page + ', itemsPerPage: ' + itemsPerPage);

		this.db.collection('item')
			.find({
				$text: {
					$search: query
				}
			})
			.limit(itemsPerPage)
			.skip(page * itemsPerPage)
			.toArray(function (err, docs) {
				callback(docs);
			});
		/*
		 * TODO-lab2A
		 *
		 * LAB #2A: Using the value of the query parameter passed to this method, perform
		 * a text search against the item collection. Do not sort the results. Select only
		 * the items that should be displayed for a particular page. For example, on the
		 * first page, only the first itemsPerPage matching the query should be displayed.
		 * Use limit() and skip() and the method parameters: page and itemsPerPage to
		 * select the appropriate matching products. Pass these items to the callback
		 * function.
		 *
		 * You will need to create a single text index on title, slogan, and description.
		 *
		 */
		//db.item.createIndex({title: "text",slogan: "text",description: "text"});
		// TODO-lab2A Replace all code above (in this method).
	};

	this.getNumSearchItems = function (query, callback) {
		"use strict";
		//console.log('getNumSearchItems =>>> query: ' + query);

		var numItems = 0;
		this.db.collection("item")
			.aggregate([
				{
					$match: {
						$text: {
							$search: query
						}
					}
				},
				{
					$project: {
						_id: 0,
						category: 1
					}
				},
				{
					$group: {
						_id: "$category",
						num: { $sum: 1 }
					}
				}
			])
			.toArray(function (err, docs) {
				docs.forEach(function (doc) {
					numItems = numItems + doc.num;
				});
				//console.log('getNumSearchItems =>>>> err: ' + JSON.stringify(err));
				//console.log('getNumSearchItems =>>>> numItems: ' + numItems);
				callback(numItems);
			});
		/*
		 * TODO-lab2B
		 *
		 * LAB #2B: Using the value of the query parameter passed to this method, count the
		 * number of items in the "item" collection matching a text search. Pass the count
		 * to the callback function.
		 *
		 */
	};


	this.getItem = function (itemId, callback) {
		"use strict";

		/*
		 * TODO-lab3
		 *
		 * LAB #3: Query the "item" collection by _id and pass the matching item
		 * to the callback function.
		 *
		 */

		this.db.collection("item")
			.find({
				_id: itemId
			})
			.toArray(function (err, docs) {
				//console.log('getItem =>>> err: ' + err + ', docs: ' + JSON.stringify(docs));
				callback(docs[ 0 ]);
				//console.log('getItem =>>> itemId: ' + itemId + ', item: ' + JSON.stringify(item));
			});
		//var item = this.createDummyItem();
		return;

		// TODO-lab3 Replace all code above (in this method).

		//callback(item);
	};


	this.getRelatedItems = function (callback) {
		"use strict";

		this.db.collection("item").find({})
			.limit(4)
			.toArray(function (err, relatedItems) {
				assert.equal(null, err);
				callback(relatedItems);
			});
	};


	this.addReview = function (itemId, comment, name, stars, callback) {
		"use strict";
		//console.log('addReview =>>> itemId: ' + itemId + ', comment: ' + comment + ', name:' + name + ', stars:' + stars);

		/*
		 * TODO-lab4
		 *
		 * LAB #4: Add a review to an item document. Reviews are stored as an
		 * array value for the key "reviews". Each review has the fields: "name", "comment",
		 * "stars", and "date".
		 *
		 */

		//var self = this.db;
		var reviewDoc = {
			"name": name,
			"comment": comment,
			"stars": stars,
			"date": Date.now()
		};
		//
		//this.db.collection("item")
		//	.find({
		//		_id: itemId
		//	})
		//	.toArray(function (err, docs) {
		//		//console.log('getItem =>>> err: ' + err + ', docs: ' + JSON.stringify(docs));
		//		var doc = docs[ 0 ];
		//
		//
		//		doc.reviews.push([ reviewDoc ]);
		//
		//
		//		callback(doc);
		//		//console.log('getItem =>>> itemId: ' + itemId + ', item: ' + JSON.stringify(item));
		//	});

		this.db.collection('item').updateOne({
				"_id": itemId
			},
			{$addToSet: {"reviews": reviewDoc}}
		);

		this.db.collection("item")
			.find({
				_id: itemId
			})
			.toArray(function (err, docs) {
				var doc = docs[ 0 ];
				//console.log('getItem =>>> err: ' + err + ', docs: ' + JSON.stringify(doc));
				callback(doc);
			});
		return;
		//this.db.updateOne({
		//	"_id": "itemId"
		//}, reviewDoc);

		var dummyItem = this.createDummyItem();
		dummyItem.reviews = [ reviewDoc ];
		callback(dummyItem);
	}


	this.createDummyItem = function () {
		"use strict";

		var item = {
			_id: 1,
			title: "Gray Hooded Sweatshirt",
			description: "The top hooded sweatshirt we offer",
			slogan: "Made of 100% cotton",
			stars: 0,
			category: "Apparel",
			img_url: "/img/products/hoodie.jpg",
			price: 29.99,
			reviews: []
		};

		return item;
	}
}


module.exports.ItemDAO = ItemDAO;
