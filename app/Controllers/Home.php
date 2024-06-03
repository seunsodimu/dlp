<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use App\Models\UserModel;
use App\Models\ServiceModel;    

class Home extends BaseController
{
    public function __construct()
    {
        
    }
    public function index()
    {
        if (session()->get('isLoggedIn')) {
            return redirect()->to('dashboard');
        }else{
            return view('login');
        }
    }

    public function login()
    {
        // if (session()->get('isLoggedIn')) {
        //     return redirect()->to('dashboard');
        // }else{
        //     return view('login');
        // }
    }

    public function dashboard()
    {
        $services = new ServiceModel();
        $data['services'] = $services->getAllServices();
        $data['packagetypes'] = $services->getPackageTypes();
        $data['dropofftypes'] = $services->getDropOffTypes();
        // var_dump($data['services']); exit;
        return view('home', $data);
    }

    public function logout()
    {
        session()->destroy();
        return redirect()->to('/');
    }

    public function markupSetting()
    {
        $model = new ServiceModel();
        $data['upcharges'] = $model->getUpcharges();
        return view('markup-setting', $data);
    }

    public function changeTheme()
    {
        if (session()->get('bgcolor') == 'light') {
            session()->set('bgcolor', 'dark');
            session()->set('logoimg', 'assets/images/roc-sup-q600x_210x_light.png');
        } else {
            session()->set('bgcolor', 'light');
            session()->set('logoimg', 'assets/images/roc-sup-q600x_210x.avif');
        }
        return redirect()->back();
    }
}
