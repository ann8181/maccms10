<?php
namespace app\admin\controller;
use think\Db;
use think\Config;
use think\Cache;

class Domain extends Base
{

    public function index()
    {
        if (Request()->isPost()) {
            $config = input();

            $tmp = $config['domain'];
            $domain=[];



            foreach ($tmp['site_url'] as $k=>$v){

                $domain[$v] =[
                   'site_url'=>$v,
                    'site_name'=>$tmp['site_name'][$k],
                    'site_keywords'=>$tmp['site_keywords'][$k],
                    'site_description'=>$tmp['site_description'][$k],
                    'template_dir'=>$tmp['template_dir'][$k],
                    'html_dir'=>$tmp['html_dir'][$k],
                    'ads_dir'=>$tmp['ads_dir'][$k],
                ];

            }


            $res = mac_arr2file(APP_PATH . 'extra/domain.php', $domain);
            if ($res === false) {
                return $this->error(lang('save_err'));
            }
            return $this->success(lang('save_ok'));
        }


        $templates = glob('./template' . '/*', GLOB_ONLYDIR);
        foreach ($templates as $k => &$v) {
            $v = str_replace('./template/', '', $v);
        }
        $this->assign('templates', $templates);

        $config = config('domain');
        $this->assign('domain_list', $config);
        $this->assign('title', lang('admin/domain/title'));
        return $this->fetch('admin@domain/index');
    }

    public function del()
    {
        $param = input();
        if(!empty($param['ids'])){
            $list = config('domain');
            unset($list[$param['ids']]);
            $res = mac_arr2file( APP_PATH .'extra/domain.php', $list);
            if($res===false){
                return $this->error(lang('del_err'));
            }
        }
        return $this->success(lang('del_ok'));
    }

    public function export()
    {
        $list = config('domain');
        $html = '';
        foreach($list as $k=>$v){
            $html .= $v['site_url'].'$'.$v['site_name'].'$'.$v['site_keywords'].'$'.$v['site_description'].'$'.$v['template_dir'].'$'.$v['html_dir'].'$'.$v['ads_dir']."\n";
        }

        header("Content-type: application/octet-stream");
        header("Content-Disposition: attachment; filename=mac_domains.txt");
        echo $html;
    }

    public function import()
    {
        $file = $this->request->file('file');
        $info = $file->rule('uniqid')->validate(['size' => 10240000, 'ext' => 'txt']);
        if ($info) {
            $data = file_get_contents($info->getpathName());
            @unlink($info->getpathName());
            if($data){
                $list = explode(chr(10),$data);

                $domain =[];

                foreach($list as $k=>$v){
                    if(!empty($v)) {
                        $one = explode('$', $v);
                        $domain[$one[0]] = [
                            'site_url' => $one[0],
                            'site_name' => $one[1],
                            'site_keywords' => $one[2],
                            'site_description' => $one[3],
                            'template_dir' => $one[4],
                            'html_dir' => $one[5],
                            'ads_dir'=>$one[6],
                        ];
                    }
                }

                $res = mac_arr2file( APP_PATH .'extra/domain.php', $domain);
                if($res===false){
                    return $this->error(lang('write_err_config'));
                }
            }
            return $this->success(lang('import_err'));
        }
        else{
            return $this->error($file->getError());
        }
    }
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
                return $this->error(lang('save_err'));
            }
            return $this->success(lang('save_ok'));            
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
        $param = input('','','htmlentities');
        $config = config('domain');
        if (Request()->isPost()) {
            $validate = \think\Loader::validate('Token');
            if(!$validate->check($param)){
                return $this->error($validate->getError());
            }
            unset($param['__token__']);
        	$domain = $param['domain'];
            $config[$domain]['view'] = $param['view'];
            $config[$domain]['path'] = $param['path'];
            $config[$domain]['rewrite'] = $param['rewrite'];
            $res = mac_arr2file(APP_PATH . 'extra/domain.php', $config);
            if ($res === false) {
                return $this->error(lang('save_err'));
            }
            return $this->success(lang('save_ok'));            
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
    public function configseo()
    {
        $config = config('domain');
        $param = input('','','htmlentities');
        if (Request()->isPost()) {
            $validate = \think\Loader::validate('Token');
            if(!$validate->check($param)){
                return $this->error($validate->getError());
            }
            unset($param['__token__']);
            $domain = $param['domain'];
            $config[$domain]['seo'] = $param['seo'];
            $res = mac_arr2file(APP_PATH . 'extra/domain.php', $config);
            if ($res === false) {
                return $this->error(lang('save_err'));
            }
            return $this->success(lang('save_ok'));
        }
        $domain = $config[$param['id']];
        if(empty($domain['view'])){
        	$cnf = config('maccms');
            $domain['seo'] = $cnf['seo'];
        }            
        $this->assign('config', $domain);
        return $this->fetch('admin@domain/configseo');
    }    
    // add end    

}
