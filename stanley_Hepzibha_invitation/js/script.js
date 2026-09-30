(function () {
	"use strict";
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------------- LOAD CONFIG ---------------- */
	fetch('src/config/constants.json')
		.then(function (res) {
			return res.json();
		})
		.then(function (CONFIG) {
			init(CONFIG);
		})
		.catch(function (err) {
			console.error('Could not load site configuration (src/config/constants.json):', err);
		});

	function init(CONFIG) {
		/* ---------------- CONFIG ---------------- */
		var WEDDING = {
			couple: CONFIG.wedding.couple,
			date: new Date(CONFIG.wedding.date),
			venue: CONFIG.wedding.venue,
			city: CONFIG.wedding.city,
			ceremony: {
				title: CONFIG.wedding.ceremony.title,
				start: new Date(CONFIG.wedding.ceremony.start),
				end: new Date(CONFIG.wedding.ceremony.end)
			},
			reception: {
				title: CONFIG.wedding.reception.title,
				start: new Date(CONFIG.wedding.reception.start),
				end: new Date(CONFIG.wedding.reception.end)
			},
			mapsUrl: CONFIG.links.googleMapsUrl
		};

		/* ---------------- IMPORTANT LINKS (from constants.json) ---------------- */
		document.querySelectorAll('.js-maps-link').forEach(function (a) {
			a.setAttribute('href', WEDDING.mapsUrl);
		});

		/* ---------------- LOADER ---------------- */
		var loader = document.getElementById('loader');
		var barFill = document.getElementById('loaderBarFill');
		var skipBtn = document.getElementById('skipIntro');
		var alreadyVisited = sessionStorage.getItem('sh_visited');

		function hideLoader() {
			loader.classList.add('hide');
			document.body.style.overflow = '';
			sessionStorage.setItem('sh_visited', '1');
		}

		document.body.style.overflow = 'hidden';

		if (alreadyVisited || reduceMotion) {
			// Skip most of the sequence for returning visitors / reduced motion
			setTimeout(hideLoader, reduceMotion ? 200 : 600);
		} else {
			requestAnimationFrame(function () {
				barFill.style.width = '100%';
			});
			setTimeout(hideLoader, 4200);
		}
		skipBtn.addEventListener('click', hideLoader);

		/* ---------------- NAV ---------------- */
		var nav = document.getElementById('nav');
		window.addEventListener('scroll', function () {
			nav.classList.toggle('scrolled', window.scrollY > 60);
		});

		var burger = document.getElementById('burgerBtn');
		var mobileMenu = document.getElementById('mobile-menu');
		var mmClose = document.getElementById('mmClose');

		function openMenu() {
			mobileMenu.classList.add('open');
			document.body.style.overflow = 'hidden';
		}

		function closeMenu() {
			mobileMenu.classList.remove('open');
			document.body.style.overflow = '';
		}
		burger.addEventListener('click', openMenu);
		mmClose.addEventListener('click', closeMenu);
		mobileMenu.querySelectorAll('a').forEach(function (a) {
			a.addEventListener('click', closeMenu);
		});

		/* ---------------- COUNTDOWN ---------------- */
		var cdDays = document.getElementById('cdDays'),
			cdHours = document.getElementById('cdHours'),
			cdMins = document.getElementById('cdMins'),
			cdSecs = document.getElementById('cdSecs'),
			cdPhrase = document.getElementById('cdPhrase');

		function pad(n) {
			return String(n).padStart(2, '0');
		}

		function tickCountdown() {
			var now = new Date();
			var diff = WEDDING.date - now;
			if (diff <= 0) {
				cdDays.textContent = '00';
				cdHours.textContent = '00';
				cdMins.textContent = '00';
				cdSecs.textContent = '00';
				cdPhrase.textContent = 'Today, our forever begins.';
				return;
			}
			var d = Math.floor(diff / (1000 * 60 * 60 * 24));
			var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
			var m = Math.floor((diff / (1000 * 60)) % 60);
			var s = Math.floor((diff / 1000) % 60);
			cdDays.textContent = pad(d);
			cdHours.textContent = pad(h);
			cdMins.textContent = pad(m);
			cdSecs.textContent = pad(s);
		}
		tickCountdown();
		setInterval(tickCountdown, 1000);

		/* ---------------- CALENDAR (Save the Date grid) ---------------- */
		var calGrid = document.getElementById('calGrid');
		var dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
		dows.forEach(function (d) {
			var el = document.createElement('div');
			el.className = 'cal-dow';
			el.textContent = d;
			calGrid.appendChild(el);
		});
		var weddingYear = WEDDING.date.getFullYear();
		var weddingMonth = WEDDING.date.getMonth(); // 0-indexed
		var weddingDay = WEDDING.date.getDate();
		var firstDay = new Date(weddingYear, weddingMonth, 1).getDay();
		var daysInMonth = new Date(weddingYear, weddingMonth + 1, 0).getDate();
		for (var i = 0; i < firstDay; i++) {
			var empty = document.createElement('div');
			empty.className = 'cal-day cal-empty';
			calGrid.appendChild(empty);
		}
		for (var d = 1; d <= daysInMonth; d++) {
			var dayEl = document.createElement('div');
			dayEl.className = 'cal-day' + (d === weddingDay ? ' highlight' : '');
			dayEl.textContent = d;
			calGrid.appendChild(dayEl);
		}

		function googleCalUrl(ev) {
			function p(n) {
				return String(n).padStart(2, '0');
			}

			function g(dt) {
				return dt.getFullYear() + p(dt.getMonth() + 1) + p(dt.getDate()) + 'T' + p(dt.getHours()) + p(dt.getMinutes()) + '00';
			}
			var params = new URLSearchParams({
				action: 'TEMPLATE',
				text: ev.title + ' — Stanley & Hephzibah',
				dates: g(ev.start) + '/' + g(ev.end),
				location: WEDDING.venue + ', ' + WEDDING.city,
				details: 'Join us as Stanley & Hephzibah celebrate their wedding.'
			});
			return 'https://www.google.com/calendar/render?' + params.toString();
		}

		document.getElementById('googleCalBtn').addEventListener('click', function () {
			window.open(googleCalUrl(WEDDING.ceremony), '_blank', 'noopener');
		});

		/* ---------------- DIRECTIONS ---------------- */
		document.getElementById('directionsBtn').addEventListener('click', function () {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (pos) {
					var url = 'https://www.google.com/maps/dir/?api=1&origin=' + pos.coords.latitude + ',' + pos.coords.longitude + '&destination=Sangamam+Mahal+Coimbatore';
					window.open(url, '_blank', 'noopener');
				}, function () {
					window.open(WEDDING.mapsUrl, '_blank', 'noopener');
				}, {
					timeout: 5000
				});
			} else {
				window.open(WEDDING.mapsUrl, '_blank', 'noopener');
			}
		});

		/* ---------------- GALLERY ---------------- */
		var galleryImages = CONFIG.media.galleryImages;
		var masonry = document.getElementById('masonry');
		galleryImages.forEach(function (img, idx) {
			var fig = document.createElement('figure');
			fig.setAttribute('tabindex', '0');
			fig.setAttribute('role', 'button');
			fig.setAttribute('aria-label', 'Open photo: ' + img.alt);
			var el = document.createElement('img');
			el.loading = 'lazy';
			el.decoding = 'async';
			el.fetchPriority = 'low';
			el.src = img.src;
			el.alt = img.alt;
			el.style.height = img.tall ? '360px' : '260px';
			el.style.width = '100%';
			el.style.objectFit = 'cover';
			el.addEventListener('load', function () {
				el.classList.add('loaded');
			}, { once: true });

			el.addEventListener('error', function () {
				el.classList.add('image-error');
			}, { once: true });
			fig.appendChild(el);
			fig.addEventListener('click', function () {
				openLightbox(idx);
			});
			fig.addEventListener('keypress', function (e) {
				if (e.key === 'Enter') openLightbox(idx);
			});
			masonry.appendChild(fig);
		});

		var lightbox = document.getElementById('lightbox');
		var lbImg = document.getElementById('lbImg');
		var lbCounter = document.getElementById('lbCounter');
		var currentIndex = 0;

		function openLightbox(idx) {
			currentIndex = idx;
			renderLightbox();
			lightbox.classList.add('open');
			document.body.style.overflow = 'hidden';
		}

		function closeLightbox() {
			lightbox.classList.remove('open');
			document.body.style.overflow = '';
		}

		function renderLightbox() {
			var img = galleryImages[currentIndex];
			lbImg.src = img.src.replace('w=800', 'w=1400');
			lbImg.alt = img.alt;
			lbCounter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
		}

		function nextImg() {
			currentIndex = (currentIndex + 1) % galleryImages.length;
			renderLightbox();
		}

		function prevImg() {
			currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
			renderLightbox();
		}

		document.getElementById('lbClose').addEventListener('click', closeLightbox);
		document.getElementById('lbNext').addEventListener('click', nextImg);
		document.getElementById('lbPrev').addEventListener('click', prevImg);
		lightbox.addEventListener('click', function (e) {
			if (e.target === lightbox) closeLightbox();
		});
		document.addEventListener('keydown', function (e) {
			if (!lightbox.classList.contains('open')) return;
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowRight') nextImg();
			if (e.key === 'ArrowLeft') prevImg();
		});
		// basic swipe support
		var touchStartX = 0;
		lightbox.addEventListener('touchstart', function (e) {
			touchStartX = e.changedTouches[0].screenX;
		});
		lightbox.addEventListener('touchend', function (e) {
			var dx = e.changedTouches[0].screenX - touchStartX;
			if (dx > 50) prevImg();
			else if (dx < -50) nextImg();
		});


		/* =========================================================
		   BLESSINGS — GOOGLE FORM + GOOGLE SHEET
		========================================================= */

		var blessingsConfig = CONFIG.blessings;

		var blForm = document.getElementById('blessingForm');
		var blName = document.getElementById('blName');
		var blMsg = document.getElementById('blMsg');
		var blVerse = document.getElementById('blVerse');

		var blSubmit = document.getElementById('blSubmit');
		var blError = document.getElementById('blError');
		var blSuccess = document.getElementById('blSuccess');

		var blWall = document.getElementById('blWall');
		var blLoading = document.getElementById('blLoading');
		var blEmpty = document.getElementById('blEmpty');
		var blRefresh = document.getElementById('blRefresh');

		var blessings = [];


		/* ---------------------------------------------------------
		   ESCAPE HTML
		--------------------------------------------------------- */

		function escapeBlessingHtml(value) {

			var div = document.createElement('div');

			div.textContent = value == null ? '' : String(value);

			return div.innerHTML;
		}


		/* ---------------------------------------------------------
		   SHOW ERROR
		--------------------------------------------------------- */

		function showBlessingError(message) {

			blError.textContent = message;
			blError.style.display = 'block';

			blSuccess.style.display = 'none';
		}


		/* ---------------------------------------------------------
		   SHOW SUCCESS
		--------------------------------------------------------- */

		function showBlessingSuccess() {

			blSuccess.style.display = 'block';
			blError.style.display = 'none';

		}


		/* ---------------------------------------------------------
		   GOOGLE FORM SUBMISSION
		--------------------------------------------------------- */

		function submitBlessingToGoogleForm(name, message, verse) {

			var formData = new FormData();

			formData.append(
				blessingsConfig.form.fields.name,
				name
			);

			formData.append(
				blessingsConfig.form.fields.message,
				message
			);

			formData.append(
				blessingsConfig.form.fields.verse,
				verse
			);


			return fetch(
				blessingsConfig.form.action,
				{
					method: 'POST',
					mode: 'no-cors',
					body: formData
				}
			);
		}


		/* ---------------------------------------------------------
		   FORM SUBMIT
		--------------------------------------------------------- */

		blForm.addEventListener('submit', function (e) {

			e.preventDefault();


			var name = blName.value.trim();
			var message = blMsg.value.trim();
			var verse = blVerse.value.trim();


			/* Validation */

			if (!name) {

				showBlessingError('Please enter your name.');

				blName.focus();

				return;
			}


			if (!message) {

				showBlessingError('Please write your blessing.');

				blMsg.focus();

				return;
			}


			/* Loading state */

			blSubmit.classList.add('is-loading');

			blError.style.display = 'none';
			blSuccess.style.display = 'none';


			submitBlessingToGoogleForm(
				name,
				message,
				verse
			)
				.then(function () {

					/*
					  Google Forms returns an opaque response because
					  no-cors is being used.
				
					  The submission itself has been sent successfully.
					*/

					blForm.reset();

					showBlessingSuccess();


					/*
					  Google Sheets needs a short moment to receive
					  the new Google Forms response.
					*/

					setTimeout(function () {

						loadBlessings();

					}, 1800);


					setTimeout(function () {

						blSuccess.style.display = 'none';

					}, 5000);

				})
				.catch(function (error) {

					console.error(
						'Blessing submission failed:',
						error
					);

					showBlessingError(
						'Something went wrong. Please try again.'
					);

				})
				.finally(function () {

					blSubmit.classList.remove('is-loading');

				});

		});


		/* ---------------------------------------------------------
		   GOOGLE SHEET URL
		--------------------------------------------------------- */

		function getBlessingsSheetUrl() {

			var sheetId = blessingsConfig.sheet.id;
			var gid = blessingsConfig.sheet.gid || '0';

			return (
				'https://docs.google.com/spreadsheets/d/' +
				encodeURIComponent(sheetId) +
				'/gviz/tq?' +
				'gid=' +
				encodeURIComponent(gid) +
				'&tqx=out:json'
			);
		}


		/* ---------------------------------------------------------
		   PARSE GOOGLE VISUALIZATION RESPONSE
		--------------------------------------------------------- */

		function parseGoogleSheetResponse(text) {

			/*
			  Google returns:
		  
			  google.visualization.Query.setResponse({...});
			*/

			var start = text.indexOf('{');
			var end = text.lastIndexOf('}');

			if (start === -1 || end === -1) {
				throw new Error('Invalid Google Sheet response.');
			}

			var json = JSON.parse(
				text.substring(start, end + 1)
			);

			return json;
		}


		/* ---------------------------------------------------------
		   GET CELL VALUE
		--------------------------------------------------------- */

		function getCellValue(row, index) {

			if (
				!row ||
				!row.c ||
				!row.c[index]
			) {
				return '';
			}

			var cell = row.c[index];

			if (cell.v == null) {
				return '';
			}

			return String(cell.f != null ? cell.f : cell.v).trim();
		}


		/* ---------------------------------------------------------
		   LOAD BLESSINGS
		--------------------------------------------------------- */

		function loadBlessings() {

			blLoading.classList.add('show');

			blEmpty.classList.remove('show');


			fetch(
				getBlessingsSheetUrl(),
				{
					method: 'GET',
					cache: 'no-store'
				}
			)
				.then(function (response) {

					if (!response.ok) {
						throw new Error(
							'Could not load Google Sheet.'
						);
					}

					return response.text();

				})
				.then(function (text) {

					var data = parseGoogleSheetResponse(text);

					var rows =
						data &&
							data.table &&
							data.table.rows
							? data.table.rows
							: [];


					/*
					  Sheet structure:
				
					  Column 0 = Timestamp
					  Column 1 = Your Name
					  Column 2 = Write your blessing
					  Column 3 = BIBLE VERSE
					*/


					blessings = rows
						.map(function (row) {

							return {

								timestamp: getCellValue(row, 0),

								name: getCellValue(row, 1),

								message: getCellValue(row, 2),

								verse: getCellValue(row, 3)

							};

						})
						.filter(function (item) {

							return item.name && item.message;

						})
						.reverse();


					renderBlessings();

				})
				.catch(function (error) {

					console.error(
						'Could not load blessings:',
						error
					);

					blLoading.classList.remove('show');

					/*
					  Don't show a confusing "No blessings"
					  message if the Sheet itself failed.
					*/

					blWall.innerHTML =
						'<div class="bl-load-error">' +
						'Blessings are temporarily unavailable.' +
						'</div>';

				});

		}


		/* ---------------------------------------------------------
		   RENDER BLESSINGS
		--------------------------------------------------------- */

		function renderBlessings() {

			blWall.innerHTML = '';

			blLoading.classList.remove('show');


			var maxCards =
				blessingsConfig.display &&
					blessingsConfig.display.maxCards
					? blessingsConfig.display.maxCards
					: 50;


			var visibleBlessings =
				blessings.slice(0, maxCards);


			if (!visibleBlessings.length) {

				blEmpty.classList.add('show');

				return;

			}


			blEmpty.classList.remove('show');


			visibleBlessings.forEach(function (blessing) {

				var card =
					document.createElement('article');

				card.className = 'bl-card';


				var verseHTML =
					blessing.verse
						? '<span class="verse">' +
						escapeBlessingHtml(blessing.verse) +
						'</span>'
						: '';


				card.innerHTML =

					verseHTML +

					'<p>“' +
					escapeBlessingHtml(blessing.message) +
					'”</p>' +

					'<span class="by">— ' +
					escapeBlessingHtml(blessing.name) +
					'</span>';


				blWall.appendChild(card);

			});

		}


		/* ---------------------------------------------------------
		   REFRESH BUTTON
		--------------------------------------------------------- */

		blRefresh.addEventListener(
			'click',
			function () {

				loadBlessings();

			}
		);


		/* ---------------------------------------------------------
		   AUTOMATIC REFRESH
		--------------------------------------------------------- */

		if (
			blessingsConfig.display &&
			blessingsConfig.display.refreshInterval
		) {

			setInterval(
				loadBlessings,
				blessingsConfig.display.refreshInterval
			);
		}


		/* ---------------------------------------------------------
		   INITIAL LOAD
		--------------------------------------------------------- */

		loadBlessings();


		/* ---------------- MUSIC ---------------- */
		var audio = document.getElementById('weddingAudio');
		var musicFab = document.getElementById('music-fab');
		var navMusicBtn = document.getElementById('navMusicBtn');
		var musicToast = document.getElementById('music-toast');
		var isPlaying = false;

		function showToast(msg) {
			musicToast.textContent = msg;
			musicToast.classList.add('show');
			setTimeout(function () {
				musicToast.classList.remove('show');
			}, 2600);
		}

		function toggleMusic() {
			if (!isPlaying) {
				var p = audio.play();
				if (p && p.catch) {
					p.then(function () {
						isPlaying = true;
						musicFab.classList.add('playing');
						musicFab.setAttribute('aria-pressed', 'true');
						musicFab.setAttribute('aria-label', 'Pause music');
					}).catch(function () {
						showToast('Add your song file to enable music');
					});
				}
			} else {
				audio.pause();
				isPlaying = false;
				musicFab.classList.remove('playing');
				musicFab.setAttribute('aria-pressed', 'false');
				musicFab.setAttribute('aria-label', 'Play our song');
			}
		}
		musicFab.addEventListener('click', toggleMusic);
		navMusicBtn.addEventListener('click', toggleMusic);

		/* ---------------- BACK TO TOP ---------------- */
		document.getElementById('backTop').addEventListener('click', function () {
			window.scrollTo({
				top: 0,
				behavior: reduceMotion ? 'auto' : 'smooth'
			});
		});
	}
})();