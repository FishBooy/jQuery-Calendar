/*
**jQuery plugin:Calendar
**By Kevin@2016
*/
;(function($){

	/*---------构造器------------*/
	var Calendar = function(index, handle, opts) {

		this.index = index;
		this.handle = handle;
		this.opts = $.extend(false, this.defaultOpts, opts || {}); //参数设置

		this.now = new Date();
		this.setData(this.now);

		this.calendar = null;

		this.createBodyHtml();
		this.createHeadHtml(this.staticData.days);
		this.inserstHtml();
		this.tdEvents();
		this.prevNext();
	};

	/*---------类方法以及属性------------*/
	//默认参数
	Calendar.prototype.defaultOpts = {
		theme: 'green',
		language: 'en',
		addH: 10
	};

	//用到的静态数据
	Calendar.prototype.staticData = {
		days: ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'],
		months: ['Febuary', 'January', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		months_31: [1, 3, 5, 7, 8, 10, 12],
		yue: ['一', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
		tHead: '<thead><tr>'
	};

	//首先用该类方法生成==>生成日历用到的动态数据
	Calendar.prototype.setData = function(now) {
		this.curYear = now.getFullYear();
		this.curMonth = now.getMonth();
		this.curDate = now.getDate();
		this.curDay = now.getDay();
		this.firstDay = (new Date(now.setDate(1))).getDay();
		this.curDays = this.daysConfirm(this.staticData.months_31, (this.curMonth + 1), this.curYear);
		this.prevDays = this.daysConfirm(this.staticData.months_31, this.curMonth, this.curYear);
		this.rows = Math.ceil((this.curDays - (7 - this.firstDay)) / 7);
		this.tBody = '';
		this.init = 1;
	}

	//判断当前所在月份的总计天数
	Calendar.prototype.daysConfirm = function(m_31, m, y) {
		m = m ? m : 12;
		y = m ? y : y--;
		if (m == 2) {
			if (!y % 4 || !y % 400) {
				if (y % 100) {
					totalDays = 28;
				} else {
					totalDays = 29;
				}
			} else {
				totalDays = 28;
			}
		} else {
			if ((m_31.join().indexOf(m)) != -1) {
				totalDays = 31;
			} else {
				totalDays = 30;
			};

		}
		return totalDays;
	};

	//生成标题
	Calendar.prototype.createTitleHtml = function() {

		return '<h2><a href=""><</a><p><span class="m">' + this.staticData.months[this.curMonth] + '</span> - <span class="y">' + this.curYear + '</span></p><a href="">></a></h2>';
	}

	//生成表头
	Calendar.prototype.createHeadHtml = function(days) {
		if (this.staticData.tHead.indexOf('Fri') == -1) {
			for (var i = 0; i < days.length; i++) {
				this.staticData.tHead += '<th>' + days[i] + '</th>';
				if (i == (days.length - 1)) this.staticData.tHead += '</tr></thead>';
			};
		}
	};

	//生成表格
	Calendar.prototype.createBodyHtml = function(past) {

		past = past ? 'past' : '';

		for (var j = 0; j < (this.rows + 1); j++) {
			var tpl = '<tr>';
			for (var q = 0; q < this.staticData.days.length; q++) {
				var num = ((j + 1) * 7 - this.firstDay - (7 - (q + 1)));
				if (num > this.curDays) {
					tpl += '<td class="nextMonth">' + (num - this.curDays) + '</td>';
				} else {
					if (num == this.curDate && this.init) {
						tpl += '<td class="today">' + num + '</td>';
					} else {
						if (num <= 0) {
							tpl += '<td class="prevMonth">' + (this.prevDays + num) + '</td>';
						} else {
							tpl += (num < this.curDate) ? '<td class="past">' + num + '</td>' : '<td class="' + past + '">' + num + '</td>';
						}
					}
				}
			};
			tpl += '</tr>';
			this.tBody += tpl;

		}
	};

	//插入日历html
	Calendar.prototype.inserstHtml = function() {

		var table = '<table>' + this.staticData.tHead + this.tBody + '</table>',
			offset = this.handle.offset(),
			outerHeight = this.handle.outerHeight(),
			className = (this.opts.theme == this.defaultOpts.theme) ? '' : ('cal-the-' + this.opts.theme);

		this.calendar = $('<div>' + this.createTitleHtml() + table + '</div>')
			.css({
				left: offset.left,
				top: offset.top + outerHeight + this.opts.addH
			})
			.appendTo($('body'))
			.addClass('calendar-box ' + className)
			.attr('id', 'calendar-' + this.opts.theme + '-'+ this.index);
	};

	//单元格事件绑定
	Calendar.prototype.tdEvents = function() {
		var self = this,
			selector = 'td:not(.prevMonth):not(.nextMonth):not(.past)';

		this.calendar
			.on('click', 'td,h2,th', function(e) {
				e.stopPropagation()
			})
			.on('mouseover', selector, function() {
				$(this).addClass('hover')
			})
			.on('mouseleave', selector, function() {
				$(this).removeClass('hover')
			})
			.on('click', selector, function() {
				var dateObj = new Date((self.curMonth + 1) + '/' + $(this).text() + '/' + self.curYear);
				var inputStr = self.curYear + '-' + (self.curMonth + 1) + '-' + $(this).text() + '-' + self.staticData.days[dateObj.getDay()];
				self.handle.val(inputStr);
				self.calendar.hide();
			});
	}

	//头部前后按钮事件绑定
	Calendar.prototype.prevNext = function() {

		var self = this;

		$.each($('h2 a', this.calendar), function(k, v) {

			if (k) {
				$(v).addClass('next-btn')
			} else {
				$(v).addClass('prev-btn')
			}

			$(v).click(function(e) {
				e.preventDefault();
				e.stopPropagation();

				var month;
				if ($(this).hasClass('next-btn')) {
					if (self.curMonth == (self.staticData.months.length - 1)) {
						month = 1;
						self.curYear++;
					} else {
						month = (self.curMonth + 1) + 1;
					}
				} else {
					if (self.curMonth == 0) {
						month = self.staticData.months.length
						self.curYear--;
					} else {
						month = self.curMonth;
					}
				};

				self.reSet(month, self.curYear);
			})
		})
	};

	//日历重置刷新
	Calendar.prototype.reSet = function(month, year, toNow) {

		var date = new Date();

		if (this.curMonth != (date.getMonth()) || this.curYear != date.getFullYear() || !toNow) {

			this.now = toNow ? (new Date()) : (new Date(month + '/' + '1/' + year));
			this.setData(this.now);
			$('.m', this.calendar).text(this.staticData.months[this.curMonth]);
			$('.y', this.calendar).text(this.curYear);

			if (this.curYear < date.getFullYear()) {
				past = 1
			} else {
				if (this.curYear == date.getFullYear()) {
					past = (this.curMonth < date.getMonth()) ? 1 : 0
				} else {
					past = 0;
				}
			}

			if (this.curMonth != date.getMonth() || this.curYear != date.getFullYear()) {
				this.init = 0;
			} else {
				this.curDate = date.getDate()
			}
			this.createBodyHtml(past);
			$('tbody', this.calendar).remove();
			$('table', this.calendar).append(this.tBody);
		}
	}

	/*----------转化------------*/
	//组合为jquery插件
	$.fn.calendar = function(opts) {
		var _this = this;

		return this.click(function(e) {
			e.stopPropagation();
			var index = _this.index($(this)) + 1,
				this_calendar = $(this).data('calendar');

			if (this_calendar) {
				var cal_ele = this_calendar.calendar,
					date = new Date();
				$('.calendar-box').not(cal_ele).hide();
				if (cal_ele.css('display') == 'none') {
					this_calendar.reSet(date.getMonth(), date.getFullYear(), 1);
					cal_ele.show()
				} else {
					cal_ele.hide()
				}
			} else {
				$('.calendar-box').hide()
				$(document).click(function() {
					$('.calendar-box').hide()
				});
				var cal_obj = new Calendar(index, $(this), opts);
				$(this).data('calendar', cal_obj);
			}

		})
	}	
})(jQuery);