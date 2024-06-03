<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('/login', 'Home::login');
$routes->post('/login', 'UserController::login'); 
$routes->get('/dashboard', 'Home::dashboard', ['filter' => 'auth']);
$routes->get('/logout', 'UserController::logout');
$routes->post('/form-quote', 'ShippingController::getFDXRate', ['filter' => 'auth']);
$routes->get('/service-detail/(:any)', 'ShippingController::serviceDetail/$1', ['filter' => 'auth']);
$routes->get('/markup-settings', 'Home::markupSetting', ['filter' => 'auth']);
$routes->post('/update-upcharge', 'ShippingController::updateUpcharge', ['filter' => 'auth']);

//tests
$routes->get('/fdxTest', 'ShippingController::fdxTest', ['filter' => 'auth']);
$routes->get('/fdxTest2', 'ShippingController::fdxTest2', ['filter' => 'auth']);
$routes->get('/fdxTest4', 'ShippingController::testFdx4', ['filter' => 'auth']);


