<?php
namespace app\index\controller;

class Index extends Base
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        return $this->label_fetch('index/index');
    }
    // add by ann 2024-12-24
    public function label_taglist()
    {
        return $this->label_fetch('index/taglist');
    }
    // add end
}
