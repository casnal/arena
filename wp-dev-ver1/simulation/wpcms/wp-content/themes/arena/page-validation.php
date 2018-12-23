<?php

/*
 * 正規表現チェッカー
 * http://okumocchi.jp/php/re.php
 * 
 * 英数字と半角スペースを許可
 * 【参考サイト】http://www.it-tips.info/php/regular/
 * if(ctype_alnum($text)):
 * 
 * 
 * 
*/
  
  $array = null;
  
  if( isset( $_GET['json'] ) ||  $_GET['json'] == true || isset($_GET['callback']) ):
    
    if(isset($_GET['lang']) && isset($_GET['max']) && isset($_GET['text'])):
      
      $lang = ($_GET['lang'])? esc_js($_GET['lang']) : null;
      $max = ($_GET['max'])? esc_js($_GET['max']) : null;
      $text = ($_GET['text'])? esc_js($_GET['text']) : null;
      // urldecode($text)

      if(!$lang || !$max || !$text):
        $array['validate'] = false;
        $array['message'] = 'マークの情報が不足しています。' . $_GET['text'] . '.';
      elseif($lang == 'en'):
        // $text = str_replace('%26', '&amp;', $text);
        $text = str_replace('&amp;', '&', $text);
        if(preg_match("/^([a-zA-Z0-9]|[.-]|[&]|[\s])+$/u", $text)):
        // if(preg_match("/^([a-zA-Z0-9]|[.-]|[\s])+$/u", $text)):
        // if(preg_match("/^([a-zA-Z0-9]|[\s])+$/u", $text)):
          $count = mb_strlen($text);
          if($count > $max):
            $array['validate'] = false;
            $array['message'] = $max . '文字以下で入力してください';
            $array['count'] = $count;
          else:
            $array['validate'] = true;
          endif;
        else:
          $array['validate'] = false;
          $array['message'] = '半角英数字で入力してください';
        endif;
      elseif($lang == 'em'):
        $count = mb_strlen($text);
        if($count > $max):
          $array['validate'] = false;
          $array['message'] = $max . '文字以下で入力してください';
          $array['count'] = $count;
        // elseif(!preg_match("/^([ぁ-んァ-ヶー一-龠０-９、。\n\r]|[．−＆★・]|[\s　]|[a-zA-Z0-9&.-]|[\s])+$/u", $text)):
        elseif(!preg_match("/^([ぁ-んァ-ヶー一-龠０-９、。\n\r]|[．−★・]|[\s　]|[a-zA-Z0-9&.-]|[\s])+$/u", $text)):
        // elseif(!preg_match("/^([ぁ-んァ-ヶーa-zA-Z0-9一-龠０-９、。\n\r]|[\s　])+$/u", $text)):
          $array['validate'] = false;
          if(preg_match("/^([a-zA-Z0-9]|[\s])+$/", $text)):
            $array['message'] = '半角英数字は入力できません。';
          else:
            $array['message'] = '記号は入力できません。';
          endif;
          //$array['count'] = $count;
        else:
          $array['validate'] = true;
        endif;
      else:
        $array['validate'] = false;
        $array['message'] = 'マークの情報の指定が不正です。';
      endif;
    else:
      $array['validate'] = false;
      $array['message'] = $max . 'マークの情報に問題があります';
    endif;
    
    $json = json_encode( $array ) ;
    
    if( isset( $_GET['callback'] ) ):
      header( "Content-Type: text/javascript; charset=utf-8" );
      echo $_GET['callback'] . "(" . $json . ")";
    else:
      header( "Content-Type: application/json; charset=utf-8" );
      echo $json;
    endif;
  
  else:
  
    get_header();
    
    get_footer();
    
  endif;
?>