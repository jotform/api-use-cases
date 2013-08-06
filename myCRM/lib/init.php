<?php
ini_set('memory_limit', '256M');
//all intializations put here
ini_set("display_errors", true);
error_reporting(E_ALL);
session_start();
define("ROOT","/home/io4crm/www");
define("SMARTY",ROOT."/lib/smarty/libs/Smarty.class.php");
define("TPL",ROOT."/tpl");
define("TMPDIR",ROOT."/tmp/");

//include other files
require(ROOT."/lib/functions.php");



require(SMARTY);

class Smarty_Ext extends Smarty{

	function __construct(){
		parent::__construct();

		$this->setTemplateDir(TPL);
		$this->setCompileDir(TMPDIR . 'templates_c');
		$this->setConfigDir(TMPDIR . 'configs');
		$this->setCacheDir(TMPDIR . 'cache');
	}

	/*
		override parent display method, just to do some operations before tpl show
	*/
	public function display($template = null, $cache_id = null, $compile_id = null, $parent = null){
		$oldini = ini_get("display_errors");
		ini_set("display_errors", false);
		assignDefaultSmartyVars();
		parent::display($template , $cache_id , $compile_id , $parent );
		ini_set("display_errors", $oldini);
	}

}

$smarty = new Smarty_Ext();

/*

$smarty = new Smarty();

$smarty->setTemplateDir(TPL);
$smarty->setCompileDir(TMPDIR . 'templates_c');
$smarty->setConfigDir(TMPDIR . 'configs');
$smarty->setCacheDir(TMPDIR . 'cache');
//smarty is ready
*/


require(ROOT."/lib/mysql.php");
$db = new MySQLL("io4crm_main","io4crm_main","243243");
//db ready






?>