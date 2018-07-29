//公共方法
(function(window) {
    var x = {};
    // 导航的高度
    x.headerH = 0;
    x.footerH = 0;
    // 初始化
    x.ready = function(BarStyle) {
        if(BarStyle){
          api.setStatusBarStyle({
              style: BarStyle
          });
        }
        api.parseTapmode();
        window.addEventListener('load', function() {
            FastClick.attach(document.body);
        }, false);
    };
    //  获取节点的高度与宽度
    x.getSize = function(id) {
        var dom = $api.byId(id);
        var size = $api.offset(dom);
        return size;
    }
    /**
     * 状态栏设置
     * 沉浸式效果适配支持iOS7+，Android4.4+以上版本
     **/
    x.fixHeaderFooterBar = function(header,footer) {
        // 沉浸式效果适配支持iOS7+，Android4.4+以上版本
        if(header){
          var header = $api.byId(header);
          x.headerH = $api.fixStatusBar(header);
        }
        // 最新api.js为了适配iPhoneX增加的方法，修复底部Footer部分与iPhoneX的底部虚拟横条键重叠的问题；
        if(footer){
          var footer = $api.byId(footer);
          x.footerH = $api.fixTabBar(footer);
        }
    };
    /**
     * 一个打开窗口的简便方法
     * 无其他过多的设置内容可以使用
     * 如有复杂内容 请直接使用 api.openWin
     **/
    x.openWin = function(options) {
        var name = options.name || 'HomePage';
        var url = options.url || '../' + name + '/indexWin.html';
        var bounces = options.bounces || false;
        var pageParam = options.pageParam || {};
        var progress = options.progress || {
            type:"default",                //加载进度效果类型，默认值为 default，取值范围为 default|page，default 等同于 showProgress 参数效果；为 page 时，进度效果为仿浏览器类型，固定在页面的顶部
            title:"",                      //type 为 default 时显示的加载框标题
            text:"",                       //type 为 default 时显示的加载框内容
            color:""                       //type 为 page 时进度条的颜色，默认值为 #45C01A，支持#FFF，#FFFFFF，rgb(255,255,255)，rgba(255,255,255,1.0)等格式
        };
        api.openWin({
            name: name,
            url: url,
            bounces: bounces,
            pageParam: pageParam,
            progress:progress
        })
    };
    /**
     * 一个打开 frame 的简便方法
     * 无其他过多的设置内容可以使用
     * 如有复杂内容 请直接使用 api.openFrame
     **/
    x.openFrame = function(options) {
        var name = options.name || 'HomePage';
        var url = options.url || './indexFrm.html';
        var bounces = options.bounces && options.bounces == 'false' ? false : true;
        var pageParam = options.pageParam || {};
        var rect = options.rect || {    // 推荐使用Margin布局，用于适配屏幕的动态变化
            marginTop: x.headerH,       // main页面距离win顶部的高度
            marginBottom: x.footerH,    // main页面距离win底部的高度
            w: 'auto'                   // main页面的宽度 自适应屏幕宽度
        };
        api.openFrame({
            name: name,
            url: url,
            bounces: bounces,
            pageParam: pageParam,
            rect: rect
        })
    };
    /**
     * 公共配置内容
     *
     **/
    x.config = {
        // origin: 'http://192.168.31.183',
        origin: 'http://aft.wx.wygoo.com',
        userImages: '/public/upload/user_images/',
        goodsImages: '/public/upload/goods_images/',
        marketImages: '/public/upload/market_resources/',

        // 内容对应id
        ContentStrToId: {
            'fullRule': 2,
            'discountRule': 3,
            'shopPromotionRule': 4,
            'adRule': 5,
            'shopPromotionProvision': 6,
            'adProvision': 7
        }
    };
    // 请求的 api 集合
    x.apiUrl = {

    };

    // 重新封装 ajax
    x.ajax = function(options) {
        return new Promise(function(resolve, reject){
            resolve('修改ajax');
        });

        // 删除上面的内容
        options = {
            url: options.url,
            method: options.method || 'POST',
            data: options.data || {},
            headers: options.headers || {},
            callback: options.callback || function(ret) { x.toast(ret.msg); },
            type:options.type||'body',
            values:options.values || {},
        }
        options.headers = x.handleHeaders(options.headers);

        var obj = {
          url: x.config.origin + '/index.php/' + options.url,
          method: options.method,
          timeout: 20,
          headers: options.headers
        }
        switch (options.type) {
          case 'body':
            obj.data = {
              body:options.data
            }
            obj.headers['Content-Type'] = 'application/json;charset=utf-8';
            break;
          case 'files':
            obj.data = {
              files:options.data,
              values:options.values
            }
            break;
          case 'stream':
            obj.data = {
              stream: options.data
            }
            break;
          default:
            obj.data = {
              body:options.data
            }
        }
        return new Promise(function(resolve, reject){
            api.ajax(obj, function(ret, err) {
                api.refreshHeaderLoadDone();
                api.hideProgress();
                if (ret) {
                    if (ret.code == 0) {
                        x.toast(ret.msg);
                    } else if(ret.code == 1) {
                      resolve(ret);
                    } else {
                      x.log(ret)
                    }
                } else {
                    x.log(err)
                }
            });
        })
    }
    // headers 处理
    x.handleHeaders = function(headers) {
        headers = headers;
        headers['auth'] = 'Basic_Ivj6eZRxMTx2yiyunZvnG8R67';
        headers['client-type'] = 'app';
        if ($api.getStorage('token')) {
            headers.token = $api.getStorage('token');
        }
        return headers;
    }

    // toast
    x.toast = function(msg) {
        api.toast({
            msg: msg || '',
            duration: 2000,
            location: 'middle'
        });
    }

    // 校验
    x.validate = {
        mobile: function(value) {
            return /^1[34578]\d{9}$/.test(value);
        },
        password: function(value) {
            return /[0-9a-zA-Z]{6,20}/.test(value);
        }
    }

    // 打印日志
    x.log = function(obj){
        console.log(JSON.stringify(obj))
    }

    // 选择时间
    x.selectTime = function(callback){
        var time = '';
        if (api.systemType == 'android') {
            api.openPicker({
                type: 'date',
                title: '选择日期'
            }, function(ret, err) {
                ret.month = ret.month < 10 ? ('0' + ret.month) : ret.month
                ret.day = ret.day < 10 ? ('0' + ret.day) : ret.day
                time += ret.year + '-' + ret.month + '-' + ret.day + ' ';
                api.openPicker({
                    type: 'time',
                    title: '选择时间'
                }, function(ret, err) {
                    if (ret) {
                        ret.hour = ret.hour < 10 ? ('0' + ret.hour) : ret.hour
                        ret.minute = ret.minute < 10 ? ('0' + ret.minute) : ret.minute
                        time += ret.hour + ':' + ret.minute + ':' + '00';
                        callback(time)
                    } else {
                        alert(JSON.stringify(err));
                    }
                });
            });

        } else if (api.systemType == 'ios') {
            api.openPicker({
                type: 'data_time',
                title: '选择日期时间'
            }, function(ret, err) {
                if (ret) {
                    ret.month = ret.month < 10 ? ('0' + ret.month) : ret.month
                    ret.day = ret.day < 10 ? ('0' + ret.day) : ret.day
                    ret.hour = ret.hour < 10 ? ('0' + ret.hour) : ret.hour
                    ret.minute = ret.minute < 10 ? ('0' + ret.minute) : ret.minute
                    time = ret.year + '-' + ret.month + '-' + ret.day + ' ' + ret.hour + ':' + ret.minute + ':' + '00';
                    callback(time)
                } else {
                    alert(JSON.stringify(err));
                }
            });
        }
    }
    window.$app = x;
})(window);
