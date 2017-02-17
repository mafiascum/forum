<?php
define('IN_PHPBB', true);
$phpbb_root_path = (defined('PHPBB_ROOT_PATH')) ? PHPBB_ROOT_PATH : './';
$phpEx = substr(strrchr(__FILE__, '.'), 1);
require($phpbb_root_path . 'common.' . $phpEx);
//require($phpbb_root_path . 'includes/functions_content.' . $phpEx);
$message = $db->sql_escape($_POST['message']);
$uid = $bitfield = $options = '';

generate_text_for_storage($message, $uid, $bitfield, $options, true, true, true);

$out = json_encode(array('message' => $message, 'uid' => $uid , 'bitfield' => $bitfield));

header('Content-Type: application/json');
echo $out;

?>
