#php_maccms_v10_zhanqun

// 可能需要修改的文件
/application/route.php		接收路由规则
/application/extra/domain.php	需要针对每个站点添加$salt值 //好像已经被cache_flag替代

# 已修改的文件

- /application/common.php
- > 添加几个处理函数
```php
// 获取随机域名,方便环链使用
function mac_get_rnddomain()
{
    $domains = config('domain');
    shuffle($domains);
    $domain = $domains[rand(0, count($domains) - 1)];
    return $domain['site_url'];
}
// 中文字符编码输出,SEO优化
function nochaoscode($str, $encode = "utf-8") {
	$str = iconv($encode, "UTF-16BE", $str);
	for ($i = 0; $i < strlen($str); $i++,$i++) {
		$code = ord($str{$i}) * 256 + ord($str{$i + 1});
		if ($code < 128) {
			$output .= chr($code);
		} else if ($code != 65279) {
			$output .= "&#".$code.";";
		}
	}
	return $output;
}
// URL唯一化
//转化为字符串
function Toabc($num,$salt){
    $n =array('1','2','3','4','5','6','7','8','9','0');
	return str_replace($n,$salt,$num);
}
//转化回数字
function To123($str,$salt){
    $n =array('1','2','3','4','5','6','7','8','9','0');
	return str_replace($salt,$n,$str);
}
/**
 * 获得随机字符串
 * @param $len             需要的长度
 * @return string       返回随机字符串
 */
function getRandomStr($len){
    $chars = array(
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
        "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
        "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G",
        "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
        "S", "T", "U", "V", "W", "X", "Y", "Z"
    );
    $charsLen = count($chars) - 1;
    shuffle($chars);                            //打乱数组顺序
    $str = '';
    for($i=0; $i<$len; $i++){
        $str .= $chars[mt_rand(0, $charsLen)];    //随机取出一位
    }
    return $str;
}
```
- > 修改图片路径处理
```php
function mac_url_img($url)
{
    if(substr($url,0,4) == 'mac:'){
        $protocol = $GLOBALS['config']['upload']['protocol'];
        if(empty($protocol)){
            $protocol = 'http';
        }
        $url = str_replace('mac:', $protocol.':',$url);
    }
    elseif(substr($url,0,4) != 'http' && substr($url,0,2) != '//' && substr($url,0,1) != '/'){
        if($GLOBALS['config']['upload']['mode']=='remote'){
            $url = $GLOBALS['config']['upload']['remoteurl'] . $url;
        }
        else{
            $url = MAC_PATH . $url;
        }
    }
    // url本地化伪造
    if(substr($url,0,4) == 'http'){
        $url = '/pic/'. base64_encode($url);
    }    
    return $url;
}
```

- /thinkphp/base.php
- > 修改缓存,日志默认路径站群域名化
- > 需要测试不修改这些路径，不同站点不同模板是否会被平替
- > 实在不行，考虑修改 /application/config.php 文件，确保更新后正常使用。
```php
defined('LOG_PATH') or define('LOG_PATH', RUNTIME_PATH . 'log' . DS . $_SERVER['HTTP_HOST'] . DS);
defined('CACHE_PATH') or define('CACHE_PATH', RUNTIME_PATH . 'cache' . DS . $_SERVER['HTTP_HOST'] . DS);
defined('TEMP_PATH') or define('TEMP_PATH', RUNTIME_PATH . 'temp' . DS . $_SERVER['HTTP_HOST'] . DS);
```
- /img.php
- > 添加本地处理伪图片本地化文件

# nginx
> 添加图片本地化的伪静态
```conf
location / {
	if (!-e $request_filename){
    	rewrite  ^/pic/(.*)$ 	/img.php?p=$1  last;
		rewrite  ^(.*)$  		/index.php?s=$1  last;   break;
	}
}
```

# 文本编码
```php
	{$str|nochaoscode}
```
# 站群随机域名
> 调用随机域名函数 mac_get_rnddomain()
```php
{maccms:vod num="10" type="current" order="desc" by="rnd"}
	<a href="http://{:mac_get_rnddomain()}{:mac_url_vod_detail($vo)}">{$vo.vod_name|nochaoscode}</a>
{/maccms:vod}
```

# Redis 入口数据
- > /application/common/controller/All.php
```php
    protected function label_vod_detail($info=[],$view=0)
    {
        $param = mac_param_url();

        $this->assign('param',$param);
        if(empty($info)) {
            $res = mac_label_vod_detail($param);
            if ($res['code'] > 1) {
                return $this->error($res['msg']);
            }
            $info = $res['info'];
        }

        if(empty($info['vod_tpl'])){
            $info['vod_tpl'] = $info['type']['type_tpl_detail'];
        }
        if(empty($info['vod_tpl_play'])){
            $info['vod_tpl_play'] = $info['type']['type_tpl_play'];
        }
        if(empty($info['vod_tpl_down'])){
            $info['vod_tpl_down'] = $info['type']['type_tpl_down'];
        }

        if($view <2) {
            $res = $this->check_user_popedom($info['type']['type_id'], 2);
            if($res['code']>1){
                echo $this->error($res['msg'], mac_url('user/index') );
                exit;
            }
        }
        $this->assign('obj',$info);
        $this->label_comment();
        // 添加描叙,数量8
        // {maccms:foreach name="comment" id="vo"}
        // {$vo}
        // {/maccms:foreach}
        $redis = new Redis();
        $redis->connect('127.0.0.1', 6379);
        $comment = $redis->sRandMember('comment',8);//m3
        $this->assign('comments',$comment);
        // 添加结束
        return $info;
    }

    protected function label_vod_play($flag='play',$info=[],$view=0,$pe=0)
    {
        $param = mac_param_url();
        $this->assign('param',$param);

        if(empty($info)) {
            $res = mac_label_vod_detail($param);
            if ($res['code'] > 1) {
                return $this->error($res['msg']);
            }
            $info = $res['info'];
        }
        if(empty($info['vod_tpl'])){
            $info['vod_tpl'] = $info['type']['type_tpl_detail'];
        }
        if(empty($info['vod_tpl_play'])){
            $info['vod_tpl_play'] = $info['type']['type_tpl_play'];
        }
        if(empty($info['vod_tpl_down'])){
            $info['vod_tpl_down'] = $info['type']['type_tpl_down'];
        }


        $trysee = 0;
        $urlfun='mac_url_vod_'.$flag;
        $listfun = 'vod_'.$flag.'_list';
        if($view <2) {
            if ($flag == 'play') {
                $trysee = $GLOBALS['config']['user']['trysee'];
                if($info['vod_trysee'] >0){
                    $trysee = $info['vod_trysee'];
                }
                $popedom = $this->check_user_popedom($info['type_id'], ($pe==0 ? 3 : 5),$param,$flag,$info,$trysee);
            }
            else {
                $popedom =  $this->check_user_popedom($info['type_id'], 4,$param,$flag,$info);
            }
            $this->assign('popedom',$popedom);


            if($pe==0 && $popedom['code']>1 && empty($popedom["trysee"])){
                $info['player_info']['flag'] = $flag;
                $this->assign('obj',$info);

                if($popedom['confirm']==1){
                    $this->assign('flag',$flag);
                    echo $this->fetch('vod/confirm');
                    exit;
                }
                echo $this->error($popedom['msg'], mac_url('user/index') );
                exit;
            }
        }

        $player_info=[];
        $player_info['flag'] = $flag;
        $player_info['encrypt'] = intval($GLOBALS['config']['app']['encrypt']);
        $player_info['trysee'] = intval($trysee);
        $player_info['points'] = intval($info['vod_points_'.$flag]);
        $player_info['link'] = $urlfun($info,['sid'=>'{sid}','nid'=>'{nid}']);
        $player_info['link_next'] = '';
        $player_info['link_pre'] = '';
        if($param['nid']>1){
            $player_info['link_pre'] = $urlfun($info,['sid'=>$param['sid'],'nid'=>$param['nid']-1]);
        }
        if($param['nid'] < $info['vod_'.$flag.'_list'][$param['sid']]['url_count']){
            $player_info['link_next'] = $urlfun($info,['sid'=>$param['sid'],'nid'=>$param['nid']+1]);
        }
        $player_info['url'] = (string)$info[$listfun][$param['sid']]['urls'][$param['nid']]['url'];
        $player_info['url_next'] = (string)$info[$listfun][$param['sid']]['urls'][$param['nid']+1]['url'];

        if(substr($player_info['url'],0,6) == 'upload'){
            $player_info['url'] = MAC_PATH . $player_info['url'];
        }
        if(substr($player_info['url_next'],0,6) == 'upload'){
            $player_info['url_next'] = MAC_PATH . $player_info['url_next'];
        }

        $player_info['from'] = (string)$info[$listfun][$param['sid']]['from'];
        if((string)$info[$listfun][$param['sid']]['urls'][$param['nid']]['from'] != $player_info['from']){
            $player_info['from'] = (string)$info[$listfun][$param['sid']]['urls'][$param['nid']]['from'];
        }
        $player_info['server'] = (string)$info[$listfun][$param['sid']]['server'];
        $player_info['note'] = (string)$info[$listfun][$param['sid']]['note'];

        if($GLOBALS['config']['app']['encrypt']=='1'){
            $player_info['url'] = mac_escape($player_info['url']);
            $player_info['url_next'] = mac_escape($player_info['url_next']);
        }
        elseif($GLOBALS['config']['app']['encrypt']=='2'){
            $player_info['url'] = base64_encode(mac_escape($player_info['url']));
            $player_info['url_next'] = base64_encode(mac_escape($player_info['url_next']));
        }

        $info['player_info'] = $player_info;
        $this->assign('obj',$info);

        $pwd_key = '1-'.($flag=='play' ?'4':'5').'-'.$info['vod_id'];

        if( $pe==0 && $flag=='play' && ($popedom['trysee']>0 ) || ($info['vod_pwd_'.$flag]!='' && session($pwd_key)!='1') || ($info['vod_copyright']==1 && !empty($info['vod_jumpurl']) && $GLOBALS['config']['app']['copyright_status']==4) ) {
            $dy_play = mac_url('index/vod/'.$flag.'er',['id'=>$info['vod_id'],'sid'=>$param['sid'],'nid'=>$param['nid']]);
            $this->assign('player_data','');
            $this->assign('player_js','<div class="MacPlayer" style="z-index:99999;width:100%;height:100%;margin:0px;padding:0px;"><iframe id="player_if" name="player_if" src="'.$dy_play.'" style="z-index:9;width:100%;height:100%;" border="0" marginWidth="0" frameSpacing="0" marginHeight="0" frameBorder="0" scrolling="no" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen" ></iframe></div>');
        }
        else {
            $this->assign('player_data', '<script type="text/javascript">var player_data=' . json_encode($player_info) . '</script>');
            $this->assign('player_js', '<script type="text/javascript" src="' . MAC_PATH . 'static/js/playerconfig.js?t='.$this->_tsp.'"></script><script type="text/javascript" src="' . MAC_PATH . 'static/js/player.js?t='.$this->_tsp.'"></script>');
        }
        // 添加描叙,数量8
        // {maccms:foreach name="comment" id="vo"}
        // {$vo}
        // {/maccms:foreach}
        $redis = new Redis();
        $redis->connect('127.0.0.1', 6379);
        $comment = $redis->sRandMember('comment',8);//m3
        $this->assign('comments',$comment);
        // 添加结束
        $this->label_comment();
        return $info;
    }

    // 添加色词缓存调用
    protected function label_test(){
        $param = mac_param_url();
        $this->assign('param',$param);
        $redis = new Redis();
        $redis->connect('127.0.0.1', 6379);
        if(strlen($param['wd'])>0){
            $key = $redis->get($param['wd']);
            $arrkey = explode(',',$key);
            $titlekey = $arrkey[0];
            // 删除首个词
            array_shift($arrkey);
            // 打乱排序
            shuffle($arrkey);
            // 重新获取前面3个
            $arrkey = array_slice($arrkey,0,3);
            $keyword = implode(',',$arrkey);
            // $arrkey = array_rand($arrkey, 3);
            $this->assign('titlekey',$titlekey);
            $this->assign('key',$arrkey);
            $this->assign('keywords',$keyword);
        }
        $arrlist = array();
		for ($x=0; $x<=10; $x++) {
			$tmp = $redis->get($redis->randomKey());
			$tmpcrc = crc32($tmp);
			$arrtmp = explode(',',$tmp);
			$arrlist[$tmpcrc] = $arrtmp[0];
		}
		$this->assign('selist',$arrlist);
    }
    //----------------------

```

\application\index\controller\Base.php
- > 添加标签调用
```php
    public function __construct()
    {
        parent::__construct();
        $this->check_site_status();
        $this->label_maccms();
        $this->check_browser_jump();
        $this->label_user();
        // 添加标签
        $this->label_test();
    }
 ```   

application\common\behavior\Init.php
- 无修改，新版好像已经修正了缓存文件名称问题
```php

```
application\common\controller\All.php
```php
// add by ann 2024-12-24
use Redis;
// add end
    protected function label_vod_detail($info=[],$view=0)
    {
        $param = mac_param_url();

        $this->assign('param',$param);
        if(empty($info)) {
            $res = mac_label_vod_detail($param);
            if ($res['code'] > 1) {
                return $this->error($res['msg']);
            }
            $info = $res['info'];
        }

        if(empty($info['vod_tpl'])){
            $info['vod_tpl'] = $info['type']['type_tpl_detail'];
        }
        if(empty($info['vod_tpl_play'])){
            $info['vod_tpl_play'] = $info['type']['type_tpl_play'];
        }
        if(empty($info['vod_tpl_down'])){
            $info['vod_tpl_down'] = $info['type']['type_tpl_down'];
        }

        if($view <2) {
            $res = $this->check_user_popedom($info['type']['type_id'], 2);
            if($res['code']>1){
                echo $this->error($res['msg'], mac_url('user/index') );
                exit;
            }
        }
        $this->assign('obj',$info);
        $this->label_comment();
        // 添加描叙,数量8
        // {maccms:foreach name="comment" id="vo"}
        // {$vo}
        // {/maccms:foreach}
        $redis = new Redis();
        $redis->connect('127.0.0.1', 6379);
        $comment = $redis->sRandMember('comment',8);//m3
        $this->assign('comments',$comment);
        // 添加结束
        return $info;
    }
    protected function label_vod_play($flag='play',$info=[],$view=0,$pe=0)
    {
        $param = mac_param_url();
        $this->assign('param',$param);

        if(empty($info)) {
            $res = mac_label_vod_detail($param);
            if ($res['code'] > 1) {
                return $this->error($res['msg']);
            }
            $info = $res['info'];
        }
        if(empty($info['vod_tpl'])){
            $info['vod_tpl'] = $info['type']['type_tpl_detail'];
        }
        if(empty($info['vod_tpl_play'])){
            $info['vod_tpl_play'] = $info['type']['type_tpl_play'];
        }
        if(empty($info['vod_tpl_down'])){
            $info['vod_tpl_down'] = $info['type']['type_tpl_down'];
        }


        $trysee = 0;
        $urlfun='mac_url_vod_'.$flag;
        $listfun = 'vod_'.$flag.'_list';
        if($view <2) {
            if ($flag == 'play') {
                $trysee = $GLOBALS['config']['user']['trysee'];
                if($info['vod_trysee'] >0){
                    $trysee = $info['vod_trysee'];
                }
                $popedom = $this->check_user_popedom($info['type_id'], ($pe==0 ? 3 : 5),$param,$flag,$info,$trysee);
            }
            else {
                $popedom =  $this->check_user_popedom($info['type_id'], 4,$param,$flag,$info);
            }
            $this->assign('popedom',$popedom);


            if($pe==0 && $popedom['code']>1 && empty($popedom["trysee"])){
                $info['player_info']['flag'] = $flag;
                $this->assign('obj',$info);

                if($popedom['confirm']==1){
                    $this->assign('flag',$flag);
                    echo $this->fetch('vod/confirm');
                    exit;
                }
                echo $this->error($popedom['msg'], mac_url('user/index') );
                exit;
            }
        }

        $player_info=[];
        $player_info['flag'] = $flag;
        $player_info['encrypt'] = intval($GLOBALS['config']['app']['encrypt']);
        $player_info['trysee'] = intval($trysee);
        $player_info['points'] = intval($info['vod_points_'.$flag]);
        $player_info['link'] = $urlfun($info,['sid'=>'{sid}','nid'=>'{nid}']);
        $player_info['link_next'] = '';
        $player_info['link_pre'] = '';
        if($param['nid']>1){
            $player_info['link_pre'] = $urlfun($info,['sid'=>$param['sid'],'nid'=>$param['nid']-1]);
        }
        if($param['nid'] < $info['vod_'.$flag.'_list'][$param['sid']]['url_count']){
            $player_info['link_next'] = $urlfun($info,['sid'=>$param['sid'],'nid'=>$param['nid']+1]);
        }
        $player_info['url'] = (string)$info[$listfun][$param['sid']]['urls'][$param['nid']]['url'];
        $player_info['url_next'] = (string)$info[$listfun][$param['sid']]['urls'][$param['nid']+1]['url'];

        if(substr($player_info['url'],0,6) == 'upload'){
            $player_info['url'] = MAC_PATH . $player_info['url'];
        }
        if(substr($player_info['url_next'],0,6) == 'upload'){
            $player_info['url_next'] = MAC_PATH . $player_info['url_next'];
        }

        $player_info['from'] = (string)$info[$listfun][$param['sid']]['from'];
        if((string)$info[$listfun][$param['sid']]['urls'][$param['nid']]['from'] != $player_info['from']){
            $player_info['from'] = (string)$info[$listfun][$param['sid']]['urls'][$param['nid']]['from'];
        }
        $player_info['server'] = (string)$info[$listfun][$param['sid']]['server'];
        $player_info['note'] = (string)$info[$listfun][$param['sid']]['note'];

        if($GLOBALS['config']['app']['encrypt']=='1'){
            $player_info['url'] = mac_escape($player_info['url']);
            $player_info['url_next'] = mac_escape($player_info['url_next']);
        }
        elseif($GLOBALS['config']['app']['encrypt']=='2'){
            $player_info['url'] = base64_encode(mac_escape($player_info['url']));
            $player_info['url_next'] = base64_encode(mac_escape($player_info['url_next']));
        }

        $info['player_info'] = $player_info;
        $this->assign('obj',$info);

        $pwd_key = '1-'.($flag=='play' ?'4':'5').'-'.$info['vod_id'];

        if( $pe==0 && $flag=='play' && ($popedom['trysee']>0 ) || ($info['vod_pwd_'.$flag]!='' && session($pwd_key)!='1') || ($info['vod_copyright']==1 && !empty($info['vod_jumpurl']) && $GLOBALS['config']['app']['copyright_status']==4) ) {
            $dy_play = mac_url('index/vod/'.$flag.'er',['id'=>$info['vod_id'],'sid'=>$param['sid'],'nid'=>$param['nid']]);
            $this->assign('player_data','');
            $this->assign('player_js','<div class="MacPlayer" style="z-index:99999;width:100%;height:100%;margin:0px;padding:0px;"><iframe id="player_if" name="player_if" src="'.$dy_play.'" style="z-index:9;width:100%;height:100%;" border="0" marginWidth="0" frameSpacing="0" marginHeight="0" frameBorder="0" scrolling="no" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen" ></iframe></div>');
        }
        else {
            $this->assign('player_data', '<script type="text/javascript">var player_data=' . json_encode($player_info) . '</script>');
            $this->assign('player_js', '<script type="text/javascript" src="' . MAC_PATH . 'static/js/playerconfig.js?t='.$this->_tsp.'"></script><script type="text/javascript" src="' . MAC_PATH . 'static/js/player.js?t='.$this->_tsp.'"></script>');
        }
        // 添加描叙,数量8
        // {maccms:foreach name="comment" id="vo"}
        // {$vo}
        // {/maccms:foreach}
        $redis = new Redis();
        $redis->connect('127.0.0.1', 6379);
        $comment = $redis->sRandMember('comment',8);//m3
        $this->assign('comments',$comment);
        // 添加结束
        $this->label_comment();
        return $info;
    }
    // add by ann 2024-12-24
    // 添加色词缓存调用
    protected function label_taglist(){
        $param = mac_param_url();
        $this->assign('param',$param);
        $redis = new Redis();
        $redis->connect('127.0.0.1', 6379);
        if(strlen($param['wd'])>0){
            $key = $redis->get($param['wd']);
            $arrkey = explode(',',$key);
            $titlekey = $arrkey[0];
            // 删除首个词
            array_shift($arrkey);
            // 打乱排序
            shuffle($arrkey);
            // 重新获取前面3个
            $arrkey = array_slice($arrkey,0,3);
            $keyword = implode(',',$arrkey);
            // $arrkey = array_rand($arrkey, 3);
            $this->assign('titlekey',$titlekey);
            $this->assign('key',$arrkey);
            $this->assign('keywords',$keyword);
        }
        $arrlist = array();
		for ($x=0; $x<=10; $x++) {
			$tmp = $redis->get($redis->randomKey());
			$tmpcrc = crc32($tmp);
			$arrtmp = explode(',',$tmp);
			$arrlist[$tmpcrc] = $arrtmp[0];
		}
		$this->assign('taglist',$arrlist);
    }
    // add end   
```
application\index\controller\Base.php
```php
    public function __construct()
    {
        parent::__construct();
        $this->check_site_status();
        $this->label_maccms();
        $this->check_browser_jump();
        $this->label_user();
        // add by ann 2024-12-24
        // 添加标签
        $this->label_taglist();
        // add end
    }
```
application\index\controller\Index.php
```php
    // add by ann 2024-12-24
    public function test()
    {
        return $this->label_fetch('index/taglist');
    }
    // add end
```
# 站群域名管理
application\admin\common\auth.php
- > 菜单入口 无修改
application\admin\controller\Domain.php
- 添加了2个函数，需要进行新版测试
```php
    // add start by ann 2024-12-24
    public function add(){
        $param = input();
        // print_r($param);
        $config = config('domain');
        if (Request()->isPost()) {
        	$param = input();
        	$param['domain']['site_url'] = trim($param['domain']['site_url']);
            $tmp[$param['domain']['site_url']] = $param['domain'];
            $domain = array_merge($config,$tmp);
            $res = mac_arr2file(APP_PATH . 'extra/domain.php', $domain);
            if ($res === false) {
                return $this->error('保存失败，请重试!');
            }
            return $this->success('保存成功!');            
        }
        if(!empty($param['id'])){
        	$info = $config[$param['id']];
        	$this->assign('info', $info);
        }
        $templates = glob('./template' . '/*', GLOB_ONLYDIR);
        foreach ($templates as $k => &$v) {
            $v = str_replace('./template/', '', $v);
        }
        $this->assign('templates', $templates);
        return $this->fetch('admin@domain/add');
    }
    public function configurl(){
        $param = input();
        $config = config('domain');
        if (Request()->isPost()) {
        	$domain = $param['domain'];
            $config[$domain]['view'] = $param['view'];
            $config[$domain]['path'] = $param['path'];
            $config[$domain]['rewrite'] = $param['rewrite'];
            $res = mac_arr2file(APP_PATH . 'extra/domain.php', $config);
            if ($res === false) {
                return $this->error('保存失败，请重试!');
            }
            return $this->success('保存成功!');            
        }
        $domain = $config[$param['id']];
        if(empty($domain['view'])){
        	$cnf = config('maccms');
            $domain['view'] = $cnf['view'];
            $domain['path'] = $cnf['path'];
            $domain['rewrite'] = $cnf['rewrite'];
        }    
        $this->assign('config', $domain);
        return $this->fetch('admin@domain/configurl');
    }    
    // add end  
```
- 下面文件需要进行对比修改
application\admin\view\domain
application\admin\view\domain\add.html
application\admin\view\domain\configurl.html
application\admin\view\domain\import.html
application\admin\view\domain\index.html


# 安装初始化分类
application\install\sql\initdata.sql