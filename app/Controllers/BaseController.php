<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;
use App\Models\RolePrivilegesModel;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 */
abstract class BaseController extends Controller
{
    /**
     * Instance of the main Request object.
     *
     * @var CLIRequest|IncomingRequest
     */
    protected $request;

    /**
     * An array of helpers to be loaded automatically upon
     * class instantiation. These helpers will be available
     * to all other controllers that extend BaseController.
     *
     * @var list<string>
     */
    protected $helpers = [];

    /**
     * Be sure to declare properties for any property fetch you initialized.
     * The creation of dynamic property is deprecated in PHP 8.2.
     */
    // protected $session;

    /**
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);

        // Preload any models, libraries, etc, here.

        // E.g.: $this->session = \Config\Services::session();
       
    }

    protected function checkPrivilege($requiredPrivilege) {
        $userRole = session()->get('user_role'); // Assuming you store user role in session
        // Fetch user privileges based on their role from the database
        $model = new RolePrivilegesModel();
        $privileges = $model->getPrivilegesByRole($userRole);
        
        if (!in_array($requiredPrivilege, $privileges)) {
            throw new \CodeIgniter\Exceptions\PageNotFoundException('You do not have permission to access this page.');
        }
    }

    public function log_user_activity($user_id, $type, $description)
    {
        $activityLogModel = new \App\Models\ActivityLogModel();
        $data = [
            'user_id' => $user_id,
            'activity_type' => $type,
            'activity_desc' => $description,
            'ip_address' => $_SERVER['REMOTE_ADDR'], // Capture IP address
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] // Capture User Agent
        ];
        $activityLogModel->logActivity($data);
    }
    
}
