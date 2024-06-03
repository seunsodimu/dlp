<?php namespace App\Models;

use CodeIgniter\Model;

class RolePrivilegesModel extends Model {
    protected $table = 'role_privileges';
    protected $allowedFields = ['role_id', 'privilege_id'];
    
    public function getPrivilegesByRole($roleId) {
        $db = \Config\Database::connect();
        $builder = $db->table('role_privileges');
        $builder->where('role_id', $roleId);
        return $builder->get()->getResultArray();
    }

    public function allPrivileges() {
        $db = \Config\Database::connect();
        $builder = $db->table('privileges');
        return $builder->get()->getResultArray();
    }
}
