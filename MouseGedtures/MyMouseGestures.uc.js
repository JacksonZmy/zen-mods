// ==UserScript==
// @name                 Mousegestures.uc.js
// @namespace            Mousegestures@gmail.com
// @description          自定义鼠标手势
// @author               紫云飞&黒仪大螃蟹
// @homepageURL          http://www.cnblogs.com/ziyunfei/archive/2011/12/15/2289504.html
// @include              chrome://browser/content/browser.xhtml
// @include              chrome://browser/content/browser.xul
// @charset              UTF-8
// ==/UserScript==
(() => {
    'use strict';
    let ucjsMouseGestures = {
        lastX: 0,
        lastY: 0,
        directionChain: '',
        isMouseDownL: false,
        isMouseDownR: false,
        hideFireContext: false,
        shouldFireContext: false,
        GESTURES: {
            'L': {name: '后退', cmd: () => gBrowser.webNavigation.canGoBack && gBrowser.webNavigation.goBack()},
            'R': {name: '前进', cmd: () => gBrowser.webNavigation.canGoForward && gBrowser.webNavigation.goForward()},


            'U': {name: '向上滚动', cmd: () => goDoCommand('cmd_scrollPageUp')},
            'D': {name: '向下滚动', cmd: () => goDoCommand('cmd_scrollPageDown')},


            'UD': {
                name: '刷新', cmd: function () {
                    document.getElementById("Browser:Reload").doCommand();
                }
            },
            'DU': {
                name: '强制刷新', cmd: function () {
                    document.getElementById("Browser:ReloadSkipCache").doCommand();
                }
            },

            // 左右
            'LR': {
                name: '恢复关闭标签', cmd: function () {
                    try {
                        document.getElementById('History:UndoCloseTab').doCommand();
                    } catch (ex) {
                        if ('undoRemoveTab' in gBrowser) gBrowser.undoRemoveTab(); else throw "Session Restore feature is disabled."
                    }
                }
            },
            'RL': {
                name: '恢复关闭标签', cmd: function () {
                    try {
                        document.getElementById('History:UndoCloseTab').doCommand();
                    } catch (ex) {
                        if ('undoRemoveTab' in gBrowser) gBrowser.undoRemoveTab(); else throw "Session Restore feature is disabled."
                    }
                }
            },

            // 上左
            'UL': {
                name: '激活左边的标签页', cmd: function (event) {
                    gBrowser.tabContainer.advanceSelectedTab(-1, true);
                }
            },
            // 上右
            'UR': {
                name: '激活右边的标签页', cmd: function (event) {
                    gBrowser.tabContainer.advanceSelectedTab(1, true);
                }
            },

            // 上下上 “N”字母笔画
            'UDU': {
                name: '搜索', cmd: function () {
                    document.getElementById("Tools:Search").doCommand();
                }
            },

            // 右上
            'RU': {name: '转到页首', cmd: () => goDoCommand('cmd_scrollTop')},
            // 右下
            'RD': {name: '转到页尾', cmd: () => goDoCommand('cmd_scrollBottom')},


            'DL': {
                name: '添加书签', cmd: function () {
                    document.getElementById("Browser:AddBookmarkAs").doCommand();
                }
            },
            'DR': {
                name: '打开新标签', cmd: function () {
                    BrowserCommands.openTab();
                }
            },

            // 上右下
            'URD': {
                name: '打开附加组件', cmd: function (event) {
                    BrowserAddonUI.openAddonsMgr();
                }
            },
            // 下右上
            'DRU': {
                name: '打开选项', cmd: function (event) {
                    openTrustedLinkIn("about:preferences", "tab", {inBackground: false, relatedToCurrent: true});
                }
            },

            // 上右下左 “P”字母笔画
            'URDL': {
                name: '固定/取消固定标签页', cmd: function (event) {
                    if (gBrowser.selectedTab.pinned) {
                        gBrowser.unpinTab(gBrowser.selectedTab);
                    } else {
                        gBrowser.pinTab(gBrowser.selectedTab);
                    }
                }
            },
            // 左上
            'LU': {
                name: '打开标签侧边栏', cmd: function (event) {
                    SidebarController.toggle("viewBookmarksSidebar");
                }
            },
            // 左下
            'LD': {
                name: '打开历史记录侧栏', cmd: function (event) {
                    SidebarController.toggle("viewHistorySidebar");
                }
            },
            // 左上下  “A”字母笔画
            'LUD': {
                name: '打开AI侧栏', cmd: function (event) {
                    SidebarController.toggle("viewGenaiChatSidebar");
                }
            },

            //'LDL': {name: '关闭左侧标签页', cmd: function(event) {	for (let i = gBrowser.selectedTab._tPos - 1; i >= 0; i--) if (!gBrowser.tabs[i].pinned){ gBrowser.removeTab(gBrowser.tabs[i], {animate: true});}}},
            //'RDR': {name: '关闭右侧标签页', cmd: function(event) {gBrowser.removeTabsToTheEndFrom(gBrowser.selectedTab);	gBrowser.removeTabsToTheEndFrom(gBrowser.selectedTab);gBrowser.removeTabsToTheEndFrom(gBrowser.selectedTab);}},

            //C字形：
            'LDR': {
                name: '关闭', cmd: function (event) {
                    let tab = gBrowser.selectedTab;
                    if (tab.getAttribute("pinned") !== "true") {
                        gBrowser.removeCurrentTab();
                    } else {
                        gBrowser.tabContainer.advanceSelectedTab(1, true);
                        gBrowser.discardBrowser(tab);
                    }
                }
            },
            //'RLRL': {name: '重启浏览器', cmd: function(event) {		Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit); 	}},
            //'LRLR': {name: '重启浏览器', cmd: function(event) {		Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit);   }},

            // 右上左下 “O”字母模拟
            'RLR': {
                name: '新建空白分屏', cmd: function (event) {
                    gZenViewSplitter.createEmptySplit();
                }
            },
            'LRL': {
                name: '新建空白分屏', cmd: function (event) {
                    gZenViewSplitter.createEmptySplit();
                }
            },
            'RLRU': {
                name: '取消分屏', cmd: function (event) {
                    gZenViewSplitter.toggleShortcut("unsplit");
                }
            },
            'LRLD': {
                name: '取消分屏', cmd: function (event) {
                    gZenViewSplitter.toggleShortcut("unsplit");
                }
            },


            // 右下左 右下左
            //'RDLRDL': {name: '关闭其他标签页', cmd: function(event) {gBrowser.removeAllTabsBut(gBrowser.selectedTab);}},
            'LDRUL': {
                name: '打开鼠标手势设置文件', cmd: function (event) {
                    FileUtils.getDir('UChrm', ['JS', 'MouseGestures.uc.js']).launch();
                }
            },

        },


        init: function () {
            let self = this;
            ['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'DOMMouseScroll'].forEach(type => {
                gBrowser.tabpanels.addEventListener(type, self, true);
            });
            gBrowser.tabpanels.addEventListener('unload', () => {
                ['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'DOMMouseScroll'].forEach(type => {
                    gBrowser.tabpanels.removeEventListener(type, self, true);
                });
            }, false);
        },
        handleEvent: function (event) {
            switch (event.type) {
                case 'mousedown':
                    if (event.button == 2) {
                        (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mousemove", this, false);
                        this.isMouseDownR = true;
                        this.hideFireContext = false;
                        [this.lastX, this.lastY, this.directionChain] = [event.screenX, event.screenY, ''];
                    }
                    if (event.button == 0) {
                        this.isMouseDownR = false;
                        this.stopGesture();
                    }
                    break;
                case 'mousemove':
                    if (this.isMouseDownR) {
                        let [subX, subY] = [event.screenX - this.lastX, event.screenY - this.lastY];
                        let [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
                        let direction;
                        if (distX < 10 && distY < 10) return;
                        if (distX > distY) direction = subX < 0 ? 'L' : 'R';
                        else direction = subY < 0 ? 'U' : 'D';
                        if (!this.xdTrailArea) {
                            this.xdTrailArea = document.createXULElement('hbox');
                            let canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
                            canvas.setAttribute('width', window.screen.width);
                            canvas.setAttribute('height', window.screen.height);
                            this.xdTrailAreaContext = canvas.getContext('2d');
                            this.xdTrailArea.style.cssText = '-moz-user-focus: none !important;-moz-user-select: none !important;display: -moz-box !important;box-sizing: border-box !important;pointer-events: none !important;margin: 0 !important;padding: 0 !important;width: 100% !important;height: 100% !important;border: none !important;box-shadow: none !important;overflow: hidden !important;background: none !important;opacity: 1 !important;position: fixed !important;z-index: 2147483647 !important;display: inline !important;';
                            this.xdTrailArea.appendChild(canvas);
                            gBrowser.selectedBrowser.parentNode.insertBefore(this.xdTrailArea, gBrowser.selectedBrowser.nextSibling);
                        }
                        if (this.xdTrailAreaContext) {
                            this.hideFireContext = true;
                            this.xdTrailAreaContext.strokeStyle = '#0065ff';
                            this.xdTrailAreaContext.lineJoin = 'round';
                            this.xdTrailAreaContext.lineCap = 'round';
                            this.xdTrailAreaContext.lineWidth = 2;
                            this.xdTrailAreaContext.beginPath();
                            this.xdTrailAreaContext.moveTo(this.lastX - gBrowser.selectedBrowser.screenX, this.lastY - gBrowser.selectedBrowser.screenY);
                            this.xdTrailAreaContext.lineTo(event.screenX - gBrowser.selectedBrowser.screenX, event.screenY - gBrowser.selectedBrowser.screenY);
                            this.xdTrailAreaContext.closePath();
                            this.xdTrailAreaContext.stroke();
                            this.lastX = event.screenX;
                            this.lastY = event.screenY;
                        }
                        if (direction != this.directionChain.charAt(this.directionChain.length - 1)) {
                            this.directionChain += direction;
                            StatusPanel._label = this.GESTURES[this.directionChain] ? '手势: ' + this.directionChain + ' ' + this.GESTURES[this.directionChain].name : '未知手势:' + this.directionChain;
                        }
                    }
                    break;
                case 'mouseup':
                    if (this.isMouseDownR && event.button == 2) {
                        if (this.directionChain) this.shouldFireContext = false;
                        this.isMouseDownR = false;
                        this.directionChain && this.stopGesture();
                    }
                    break;
                case 'contextmenu':
                    if (this.isMouseDownR || this.hideFireContext) {
                        this.shouldFireContext = true;
                        this.hideFireContext = false;
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    break;
                case 'DOMMouseScroll':
                    if (this.isMouseDownR) {
                        this.shouldFireContext = false;
                        this.hideFireContext = true;
                        this.directionChain = 'W' + (event.detail > 0 ? '+' : '-');
                        this.stopGesture();
                    }
                    break;
            }
        },
        stopGesture: function () {
            if (this.GESTURES[this.directionChain]) this.GESTURES[this.directionChain].cmd();
            if (this.xdTrailArea) {
                this.xdTrailArea.parentNode.removeChild(this.xdTrailArea);
                this.xdTrailArea = null;
                this.xdTrailAreaContext = null;
            }
            this.directionChain = '';
            setTimeout(() => StatusPanel._label = '', 2000);
            this.hideFireContext = true;
        }
    };
    ucjsMouseGestures.init();
})();




