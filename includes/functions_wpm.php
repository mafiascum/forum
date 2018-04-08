<?php
/**
*
* @package phpBB3
* @version $Id: $
* @copyright (c) 2007 DualFusion - 2008 ..::Frans::..
* @license http://opensource.org/licenses/gpl-license.php GNU Public License
*
*/
if (!defined('IN_PHPBB'))
{
	exit;
}

/**
* Class welcome_pm
* Send Welcome PM's and get Profile Field Information
* @author ..::Frans::..
*/
class welcome_pm
{
	var $vars = array();
	var $data = array();

	/**
	* Initializes welcome_pm class and method get_data and get_vars
	*/
	function welcome_pm()
	{
		$this->get_data();

	}

	/**
	* Method get_send_userdata()
	* Sets all info on the user that SENDS the PM
	*/

	function get_send_userdata()
	{
		global $db;
		$sql = 'SELECT u.*
				FROM ' . WPM_TABLE . ' w,
					 ' . USERS_TABLE . ' u
				WHERE w.wpm_config_id = 1
				AND w.wpm_send_id = u.user_id';
		$result = $db->sql_query($sql);
		$this->send_user_data = $db->sql_fetchrow($result);
		$db->sql_freeresult($result);
	}

	/**
	* Method get_vars
	* Sets preset dynamic vars and initializes method get_cpf_data
	*/
	function get_vars()
	{
		global $config, $user, $db, $auth;

		// Get user data from user that will be sender
		$this->get_send_userdata();

		$this->vars = array(
			0	=> array(
				'var'	=> '{USER_ID}',
				'value'	=> $user->data['user_id'],
			),
			1	=> array(
				'var'	=> '{USERNAME}',
				'value'	=> $user->data['username'],
			),
			2	=> array(
				'var'	=> '{USER_IP}',
				'value'	=> $user->data['user_ip'],
			),
			3	=> array(
				'var'	=> '{USER_REGDATE}',
				'value'	=> $user->format_date($user->data['user_regdate']),
			),
			4	=> array(
				'var'	=> '{USER_EMAIL}',
				'value'	=> $user->data['user_email'],
			),
			5	=> array(
				'var'	=> '{USER_LANG_EN}',
				'value'	=> $this->get_lang('english_name'),
			),
			6	=> array(
				'var'	=> '{USER_LANG_LOCAL}',
				'value'	=> $this->get_lang('local_name'),
			),
			7	=> array(
				'var'	=> '{USER_TZ}',
				'value'	=> $this->get_tz(),
			),
			8	=> array(
				'var'	=> '{SITE_NAME}',
				'value'	=> $config['sitename'],
			),
			9	=> array(
				'var'	=> '{SITE_DESC}',
				'value'	=> $config['site_desc'],
			),
			10	=> array(
				'var'	=> '{BOARD_CONTACT}',
				'value'	=> $config['board_contact'],
			),
			11	=> array(
				'var'	=> '{BOARD_EMAIL}',
				'value'	=> $config['board_email'],
			),
			12	=> array(
				'var'	=> '{SENDER}',
				'value'	=> $this->send_user_data['username'],
			),
			13	=> array(
				'var'	=> '{BOARD_SIG}',
				'value'	=> $config['board_email_sig'],
			),
		);

		// If we're in the acp as admin...
		if ($auth->acl_get('a_'))
		{
			//Add language entries for displaying the vars
			for ($i = 0, $size = sizeof($this->vars); $i < $size; $i++)
			{
				$this->vars[$i]['name'] = $user->lang['WPM_' . substr(substr($this->vars[$i]['var'], 0, -1), 1)];
			}
		}
	}

	/**
	* Method get_lang
	* Gets lang_id or lang_english_name based on lang_iso ($user->data['user_lang'])
	*
	* @param string $mode Tell which methods to convert to ( 'id', 'dir', 'english_name' , 'local_name', or 'author')
	* @return string $row The data converted
	*/
	function get_lang($mode)
	{
		global $db, $user;

		if ($mode)
		{
			$sql = 'SELECT lang_' . $mode . '
				FROM ' . LANG_TABLE . "
				WHERE lang_iso = '" . $db->sql_escape($user->data['user_lang']) . "'";
			$result	= $db->sql_query($sql);
			$row	= $db->sql_fetchrow($result);
			$db->sql_freeresult($result);

			if($row)
			{
				return (string) $row['lang_' . $mode];
			}
			return false;
		}
		return false;
	}

	/**
	* Method get_tz
	* Gets timezone text from number
	*
	* @return string $user->lang The timezone data
	*/
	function get_tz()
	{
		global $user;

		$tz		= strval(doubleval($user->data['user_timezone']));
		$dst	= ($user->data['user_dst']) ?  ' ' . $user->lang['tz']['dst'] : '';
		
		return $user->lang['tz'][$tz] . $dst;
	}

	/**
	* Method send_pm
	* Sends the welcome pm message to the current user
	*/ 
	function send_wpm()
	{
		global $user, $db, $phpbb_root_path, $phpEx;

		if (!function_exists('pm_notification'))
		{
			include($phpbb_root_path . 'includes/functions_privmsgs.' . $phpEx);
		}

		$user->add_lang('ucp');

		$subject	= $this->data['subject'];
		$text		= utf8_normalize_nfc($this->data['message']);

		for ($i = 0, $size = sizeof($this->vars); $i < $size; $i++)
		{
			$vars[$this->vars[$i]['var']] = $this->vars[$i]['value'];
		}

		$subject	= str_replace(array_keys($vars), array_values($vars), $subject);
		$message	= str_replace(array_keys($vars), array_values($vars), $text);

		$uid			= $bitfield			= $options		= '';
		$allow_bbcode	= $allow_smilies	= $allow_urls   = $img_status   = $flash_status = true;

		generate_text_for_storage($message, $uid, $bitfield, $options, $allow_bbcode, $allow_urls, $allow_smilies);

		$pm_data = array(
			'address_list'			=> array('u' => array($user->data['user_id'] => 'to')),
			'from_user_id'			=> $this->send_user_data['user_id'],
			'from_user_ip'			=> $this->send_user_data['user_ip'],
			'from_username'			=> $this->send_user_data['username'],
			'enable_sig'			=> false,
			'enable_bbcode'			=> true,
			'enable_smilies'		=> true,
			'enable_urls'			=> true,
			'reply_from_root_level'	=> 0,
			'reply_from_msg_id'		=> 0,
			'icon_id'				=> 0,
			'bbcode_bitfield'		=> $bitfield,
			'bbcode_uid'			=> $uid,
			'message'				=> $message,
		);
		$msg_id			= submit_pm('post', $subject, $pm_data);
		$sender_id		= $this->send_user_data['username'];
		$receiver_id	= $user->data['user_id'];

		$recipients[$receiver_id] = 'to';
		pm_notification('post', $this->send_user_data['username'], $recipients, $subject, $pm_data['message'], $msg_id);
	}

	/**
	* Method get_data
	* Gets data from wpm table
	*/ 
	function get_data()
	{
		global $db, $config;

		$sql = 'SELECT *
				FROM ' . WPM_TABLE . ' WHERE wpm_config_id = '. WPM_CONFIG_ID;
		$result	= $db->sql_query($sql);
		$row	= $db->sql_fetchrow($result);
		$db->sql_freeresult($result);

		$this->data['subject']	= $row['wpm_subject'];
		$this->data['message']	= $row['wpm_message'];
		$this->data['enable']	= (int) $row['wpm_enable'];
		$this->data['user_id']	= (int) $row['wpm_send_id'];
	}

	/**
	* Method set_data
	* Updates the wpm table (acp)
	*/
	function set_data($key, $value)
	{
		global $db;

		if(in_array($key, array('message', 'subject', 'enable', 'user_id')))
		{
			if($key == 'user_id')
			{
				$key = 'wpm_send_id';
			}
			else
			{
				$key = 'wpm_' . $key;
			}

			$sql = 'UPDATE ' . WPM_TABLE . "
				SET " . $key . " = '" . $db->sql_escape($value) . "'
				WHERE wpm_config_id = " . WPM_CONFIG_ID;
			$db->sql_query($sql);
		}
	}
}
?>