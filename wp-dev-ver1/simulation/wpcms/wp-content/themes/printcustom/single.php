<?php
/*
if(isset($_GET['mobile']) && $_GET['mobile']):
  if($_GET['mobile'] == 'on'):
    setcookie("mobile", $_GET['mobile'], time()+86400, '/simulation/printcustom/');
  elseif($_GET['mobile'] == 'off'):
    setcookie("mobile", "", time() - 3600);
  endif;
endif;
if(wp_is_mobile()):
  if(isset($_COOKIE["mobile"]) && $_COOKIE["mobile"]):
    //
  else:
    wp_redirect('/simulation/printcustom/maintenance');
    exit();
  endif;
else:
endif;
*/
?>
<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @package WordPress
 * @subpackage arena CUSTOM ORDER
 * @since 1.0
 * @version 1.0
 */
  
  $categories = get_the_terms($post->ID, 'category');
  $category = ($categories)? $categories[0] : get_term_by('slug', 'uncategorized', 'category');
  
  set_query_var('mark', array(
    'positions' => get_the_terms($post->ID, 'mark-position'),
    'direction' => get_the_terms($post->ID, 'mark-direction'),
    'fonts' => get_the_terms($post->ID, 'mark-font'),
    'colors' => get_the_terms($post->ID, 'mark-color')
  ));
  
  $have_page = in_array($category->slug, array('aquaforce-fusion-2', 'x-python-2', 'urokoskin-st', 'cloth-type', 'windbreaker-type', 'jersey-type', 't-shirt'));
  
  get_header(); 

?>

<?php 
  if(have_posts()): 
    while(have_posts()): the_post(); 
?>

  <div class="container" id="container">
    <main class="main main--simulation" id="main" role="main" data-page="Simulation">
      <article class="content content--simulation" id="content">
        <nav class="content-navigation">
          <ul class="u-clear">
            <li><a href="<?php echo get_bloginfo('url') . '/#' . $category->slug; ?>"><span>種類を選ぶ</span></a></li>
            <li class="active"><span>カスタムする</span></li>
            <li><span>オーダーする</span></li>
          </ul>
        </nav>

        <section class="section section--custom is-swimwear js-get-height">
          <div id="wear-<?php echo $post->ID; ?>" class="custom-menu">
            <ul class="custom-menu__tabs u-clear u-pc">
              <li class="active" data-tab=".base-simulation">SWIM WEAR<br>SIMULATION</li>
              <li data-tab=".mark-simulation">MARK<br>SIMULATION</li>
            </ul>

            <div class="custom-menu__head u-sp">SWIM WEAR<br>SIMULATION</div>
            <div class="custom-menu__tap is-hidden">（タップして開く）</div>

            <div class="custom-menu__content custom-menu__content--base base-simulation js-base-simulation active">
              <div class="custom-menu__inner">
                <!-- Product Type -->
                <?php get_template_part('template/custom-pick', 'type'); ?>
              </div>
              <div class="custom-menu__inner">
                <!-- Print Type -->
                <?php get_template_part('template/custom-pick', 'print'); ?>
              </div>
              <div class="custom-menu__inner">
                <!-- Colour Code -->
                <?php get_template_part('template/custom-pick', 'color-code'); ?>
              </div>
              <p class="read-more js-read-more"></p>
            </div>

            <div class="custom-menu__head u-sp">MARK<br>SIMULATION</div>
            <div class="custom-menu__tap">（タップして開く）</div>

            <div class="custom-menu__content custom-mark-simulation mark-simulation js-mark-simulation">
              <!-- 
              <div class="custom-pick custom-pick-disabled">
                只今、メンテナンス中のため、マークシミュレーション機能はご利用いただけません
              </div>
              -->
              <div class="custom-menu__inner">
                <!-- マークのありなし -->
                <?php get_template_part('template/custom-pick', 'mark'); ?>
              </div>

              <?php if(get_query_var('mark')['positions'] || get_query_var('mark')['direction']): ?>
              <div class="custom-menu__inner">
                <?php get_template_part('template/custom-pick', 'mark-print'); ?>
              </div>
              <div class="custom-menu__inner">
                <!-- マークの書体 -->
                <?php get_template_part('template/custom-pick', 'mark-font'); ?>
              </div>
              <div class="custom-menu__inner">
                <!-- マークの色 -->
                <?php get_template_part('template/custom-pick', 'mark-color'); ?>
              </div>
              <div class="custom-menu__inner">
                <!-- マークの名前 -->
                <?php get_template_part('template/custom-pick', 'mark-input'); ?>
				        <p class="form-notes">※書体06は小文字と記号の指定ができません。</p>
              </div>

              <p class="read-more js-read-more"></p>
              <?php endif; ?>
            </div>
          </div>

          <div class="item-info">
            <?php get_template_part('template/custom-info', ''); ?>
            <a href="" class="item-info__link is-red js-popup-trigger u-pc" data-popup=".popup--design-note">デザインに関する注意事項</a>
            <div class="order-info js-order-info">
              <!-- シミュレーション後のメニュー -->
              <?php get_template_part('template/custom-order', 'info'); ?>
            </div>
          </div>

          <div class="custom-display">
            <div class="custom-display-core js-base-display">
            <?php
              $basic_auth = array('user' => 'ccv', 'pass' => 'shunlock');
              $url = array('front' => get_field('svg-front'), 'back' => get_field('svg-back'));
              $ch = curl_init();
              curl_setopt($ch, CURLOPT_URL, $url['front']);
              curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
              curl_setopt($ch, CURLOPT_USERPWD, $basic_auth['user'] . ":" . $basic_auth['pass']);
              curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
              // curl_setopt($curl,CURLOPT_SSL_VERIFYPEER, false);
              $result = curl_exec($ch);
              curl_close($ch);
              echo $result;
            ?>
            </div>
      			<div class="notes-container">
      				<p class="notes">
      					<?php if(strpos($post->post_title, 'OAT-7068W') !== false): ?>
      					<!-- <span style="color: crimson">バックスタイルのグラデーション配色は、腰部と尻部にて別々グラデーションがかります。</span><br> -->
      					<?php endif; ?>
      					<span class="asterisk">*</span><span>シミュレーション画像はイメージです。<br>実際の商品と色味やマーキングの大きさ、プリント柄の入り方等が異なる場合がございますので予めご了承下さい。</span>
      					<br>
      					<span class="asterisk">*</span><span>マークには細いフチがつきます。</span>
      				</p>
      				<p class="notes">詳細は「<a href="" class="is-red js-popup-trigger" data-popup=".popup--design-note">デザインに関する注意事項</a>」をご確認下さい。</p>
      			</div>

            <div class="button-container u-sp">
              <span class="custom-rotation js-rotation" data-rotation="front" data-svg="<?php echo strtoupper($post->post_name); ?>"><i class="icon icon--rotation"></i>ROTATION</span>
              <!-- <a href="" class="custom-info__link is-red js-popup-trigger u-pc" data-popup=".popup--design-note">デザインに関する注意事項</a> -->
            </div>
          </div>

          <span class="custom-rotation u-pc js-rotation" data-rotation="front" data-svg="<?php echo strtoupper($post->post_name); ?>"><i class="icon icon--rotation"></i>ROTATION</span>
        </section>

        <div class="popup popup--order-sheet js-popup">
          <div class="order-sheet popup-inner">
          <?php get_template_part('template/popup', 'order-sheet'); ?>
          </div>
        </div>

        <div class="popup popup--mark-check js-popup">
          <div class="popup-inner mark-check">
          <?php get_template_part('template/popup', 'mark-check'); ?>
          </div>
        </div>

        <div class="popup popup--design-note js-popup">
          <div class="popup-inner design-note is-print">
            <h3 class="design-note__head">デザインに関する注意事項</h3>
            <a class="popup-close js-popup-close" style="top: 4.2%;"></a>
            <div class="design-note__inner">
              <div class="design-note__desc">
                <p><span class="asterisk">※</span>シミュレーション画像はイメージです。厳密に実際の商品と同じでなく、色味、マーキングの大きさ、プリント柄の入り方などが異なる場合があります。</p>
                <p><span class="asterisk">※</span>書体06は小文字と記号の指定ができません。</p>
                <p><span class="asterisk">※</span>ご指定の文字数によって、実施の商品とマーキングの大きさが異なります。<br>マーキングの大きさの目安は下記の通りです。</p>

                <ul class="design-note__list">
                  <li class="design-note__item">
                    <span>8文字の場合</span>
                    <div class="design-note__image is-size">
                      <img src="/simulation/assets/images/customisation/design-note/size1.png" alt="8文字の場合">
                    </div>
                  </li>
                  <li class="design-note__item">
                    <span>5文字の場合</span>
                    <div class="design-note__image is-size">
                      <img src="/simulation/assets/images/customisation/design-note/size2.png" alt="5文字の場合">
                    </div>
                  </li>
                  <li class="design-note__item">
                    <span>2文字の場合</span>
                    <div class="design-note__image is-size">
                      <img src="/simulation/assets/images/customisation/design-note/size3.png" alt="2文字の場合">
                    </div>
                  </li>
                </ul>
              </div>

              <div class="design-note__desc" style="flex-shrink: 0;">
                <p><span class="asterisk">※</span>マークには細いフチがつきます。詳細は下記の通りです。</p>
                <ul class="design-note__list">
                  <li class="design-note__item">
                    <span>・下記の品番では、マークのフチにAカラーがつきます。</span>
                    <div class="design-note__image">
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image1.jpg" alt="OAT-7062W、OAT-7062WJ、OAT-7063、OAT-7063J"></span>OAT-7062W、OAT-7062WJ、OAT-7063、OAT-7063J</p>
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image2.jpg" alt="OAT-7064W、OAT-7064WJ、OAT-7065、OAT-7065J"></span>OAT-7064W、OAT-7064WJ、OAT-7065、OAT-7065J</p>
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image3.jpg" alt="OAT-7070W、OAT-7070WJ、OAT-7071、OAT-7071J"></span>OAT-7070W、OAT-7070WJ、OAT-7071、OAT-7071J</p>
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image4.jpg" alt="OAT-7072W、OAT-7072WJ、OAT-7073、OAT-7073J"></span>OAT-7072W、OAT-7072WJ、OAT-7073、OAT-7073J</p>
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image5.jpg" alt="OAT-7074W、OAT-7074WJ、OAT-7075、OAT-7075J"></span>OAT-7074W、OAT-7074WJ、OAT-7075、OAT-7075J</p>
                    </div>
                  </li>

                  <li class="design-note__item">
                    <span>・下記の品番では、マークのフチにBカラーがつきます。</span>
                    <div class="design-note__image">
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image6.jpg" alt="OAT-7060W、OAT-7060WJ、OAT-7061、OAT-7061J"></span>OAT-7060W、OAT-7060WJ、OAT-7061、OAT-7061J</p>
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image7.jpg" alt="OAT-7066W、OAT-7066WJ、OAT-7067、OAT-7067J"></span>OAT-7066W、OAT-7066WJ、OAT-7067、OAT-7067J</p>
                    </div>
                  </li>

                  <li class="design-note__item">
                    <span>・下記の品番では、マークのフチにグラデーションの一番上のカラーがつきます。</span>
                    <div class="design-note__image">
                      <p><span><img src="/simulation/assets/images/customisation/design-note/image8.jpg" alt="OAT-7068W、OAT-7068WJ、OAT-7069、OAT-7069J"></span>OAT-7068W、OAT-7068WJ、OAT-7069、OAT-7069J</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="popup popup--system-requirements js-popup">
          <div class="system-requirements popup-inner">
          <?php get_template_part('template/popup', 'system-requirements'); ?>
          </div>
        </div>
      </article>
    </main>
  </div>

<?php
    endwhile;
  else:
    get_template_part('template/', 'none');
  endif;
?>


<?php get_footer(); ?>