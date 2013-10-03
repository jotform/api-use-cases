<?php
include 'init.php';

ini_set("display_errors",true);
error_reporting(E_ALL);

$_POST = json_decode(file_get_contents('php://input'),true);

//simple ajax handler
$method = $_POST["method"];
$data = $_POST["data"];

$handler = new handler();
$handler->exec($method,$data);


class handler{

	public function exec($method,$data){

		$result = self::$method($data);
		self::sendResponse($result);
	}

	public function sendResponse($response){
		$res = array();
		$res["result"] = $response;
		echo json_encode($res);
		exit();
	}

	private function getJobStatus($jobHash){
		return self::getRow("job","hash",$jobHash);
	}

	//insert tasks to a db
	private function setTasks($data){
		global $db;

		$apiKey = $data["apiKey"];
		$username = $data["username"];
		$email = $data["email"];

		//if there are forms set tasks
		if(count($data["forms"]) == 0){
			return false;
		}

		$job_id = self::createJob($username,$apiKey,"Migration of forms&submissions for $username",$email);

		foreach($data["forms"] as $row){

			$task_data = array();
			$task_data["formTitle"] = $row["formTitle"];
			$task_data["formId"] = $row["id"];
			$task_data = json_encode($task_data);
			self::createTask($job_id,"migrate_form",$task_data);
		}

		return self::getVal("job","hash","id",$job_id);	
	}



	//private internal functions

	private function createJob($username,$apiKey,$name,$email){
		global $db;
		$hash = self::e(sha1($username.$apiKey.$name.rand(111,2222).time()));

		list($username,$apiKey,$name,$email) = self::ea(array($username,$apiKey,$name,$email));

		$query = "insert into job (`username`,`apiKey`,`name`,`email`,`hash`,`date_created`)
					values ('$username','$apiKey','$name','$email','$hash',NOW());
		";
		
		$db->sql($query);
		return $db->LastInsertID(); //return job.id
	}

	private function createTask($job_id,$function_name,$data){
		global $db;
		$hash = self::e(sha1($job_id.$function_name.json_encode($data).rand(111,2222).time()));

		list($job_id,$function_name,$data) = self::ea(array($job_id,$function_name,$data));

		$query = "insert into task (`job_id`,`function_name`,`hash`,`data`)
					values ('$job_id','$function_name','$hash','$data');
		";
		
		$db->sql($query);
		return $db->LastInsertID(); //return task.id
	}

	//get single value from db
	private function getVal($tblname,$colname,$wcolname,$wcolvalue){
		global $db;
		list($tblname,$colname,$wcolname,$wcolvalue) = self::ea(array($tblname,$colname,$wcolname,$wcolvalue));

		$query = "select `$colname` from `$tblname` where `$wcolname` = '$wcolvalue' limit 1";
		$result = $db->sql($query);
		
		return $result[$colname];
	}
	//get single value from db
	private function getRow($tblname,$wcolname,$wcolvalue){
		global $db;
		list($tblname,$wcolname,$wcolvalue) = self::ea(array($tblname,$wcolname,$wcolvalue));

		$query = "select * from `$tblname` where `$wcolname` = '$wcolvalue' limit 1";
		$result = $db->sql($query);
		
		return $result;
	}

	private function e($str){
		global $db;
		return mysql_real_escape_string($str,$db->databaseLink);
	}

	private function ea($arr){
		foreach($arr as $key => $val){
			$arr[$key] = self::e($val);
		}
		return $arr;
	}

}


?>