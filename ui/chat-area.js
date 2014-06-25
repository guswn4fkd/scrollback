/* jslint browser: true, indent: 4, regexp: true*/
/* global $, libsb, currentState, format */

var chatEl = require("./chat.js"),
	chatArea = {};

$(function () {
	var $logs = $(".chat-area"),
		roomName = "",
		room = null,
		thread = '',
		time = null;

	$logs.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 50,
		startIndex: time,
		getItems: function (index, before, after, recycle, callback) {
			var query = {
				to: roomName,
				before: before,
				after: after
			};

			if (!roomName) return callback([]);

			index = index || time;
			query.time = index;

			if (thread) query.thread = thread;

			if (roomName == "pending" && room === null) return callback();

			if (!index && !before) return callback([false]);

			function loadTexts() {
				libsb.getTexts(query, function (err, t) {
					var texts = t.results;
					if (err) throw err; // TODO: handle the error properly.

					if (!index && texts.length === "0") {
						return callback([false]);
					}

					if (after === 0) {
						if (texts.length < before) {
							texts.unshift(false);
						}

						if (t.time) {
							texts.pop();
						}
					} else if (before === 0) {
						if (texts.length < after) {
							texts.push(false);
						}

						texts.splice(0, 1);
					}

					callback(texts.map(function (text) {
						return text && chatEl.render(null, text);
					}));
				});
			}

			loadTexts();
		}
	});

	// Insert incoming text messages.
	libsb.on("text-dn", function (text, next) {
		var $oldEl = $("#chat-" + text.id),
			$newEl = chatEl.render(null, text);

		if ($oldEl.length) {
			$oldEl.remove();
		}

		if ($logs.data("lower-limit")) {
			$logs.addBelow($newEl);
		}

		next();
	}, 100);

	libsb.on("text-up", function (text, next) {
		if ($logs.data("lower-limit")) {
			$logs.addBelow(chatEl.render(null, text));
		}

		next();
	}, 90);

	libsb.on("navigate", function (state, next) {
		var reset = false;

		if (state.source == 'text-area') return next();
		if (state.source == "init") {
			roomName = state.roomName || currentState.roomName;
			thread = state.thread || currentState.thread;
			time = state.time || time;
			reset = true;
		} else {
			if (state.roomName == "pending" && state.room === null) {
				reset = true;
				roomName = currentState.roomName;
			} else if (state.roomName && state.roomName !== state.old.roomName) {
				roomName = state.roomName;
				reset = true;
			}

			if (typeof state.thread != "undefined" && state.old && state.thread != state.old.thread) {
				thread = state.thread;
				reset = true;
			}

			if (state.old && state.time != state.old.time) {
				time = state.time;
				reset = true;
			}
		}

		if (reset) {
			$logs.reset(time);
		}

		next();
	}, 200);

	// The chatArea API.
	chatArea.getPosition = function () {
		var pos = $logs[0].scrollHeight - ($logs.scrollTop() + $logs.height());

		if (!this.value) {
			this.value = pos;
		}

		return pos;
	};

	chatArea.setPosition = function (bottom) {
		$logs.css({
			bottom: bottom
		});

		if (chatArea.getPosition.value === 0) {
			$logs.scrollTop($logs[0].scrollHeight);
		}
	};

	chatArea.setRoom = function (r) {
		roomName = r;
		$logs.find(".chat").remove();
		$logs.scroll();
	};

	var timeout,
		top = $(this).scrollTop();

	$logs.on("scroll", function () {
		var cur_top = $logs.scrollTop();

		if (top < cur_top) {
			$("body").removeClass("scroll-up").addClass("scroll-down");
		} else {
			$("body").removeClass("scroll-down").addClass("scroll-up");
		}

		top = cur_top;

		$("body").addClass("scrolling");

		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(function () {
			$("body").removeClass("scrolling").removeClass("scroll-up").removeClass("scroll-down");
			timeout = 0;
		}, 1000);

		var chats = $logs.find(".chat-item"),
			time = chats.eq(0).data("index"),
			parentOffset = $logs.offset().top;

		for (var i = 0; i < chats.size(); i++) {
			if (chats.eq(i).offset().top - parentOffset > 0) {
				time = chats.eq(i).data("index");
				break;
			}
		}

		$(".chat-position").text(format.friendlyTime(time, new Date().getTime()));

		chatArea.getPosition.value = chatArea.getPosition();

		if (chatArea.getPosition.value === 0) {
			time = null;
		}

		libsb.emit('navigate', {
			time: time,
			source: 'text-area'
		});

	});
});

module.exports = chatArea;
