<?php

namespace App\Models;

use CodeIgniter\Model;

class ServiceModel extends Model
{
    protected $table = 'service_types';
    protected $allowedFields = ['servicetype_id', 'service_type', 'abbrv', 'prfx', 'note'];

    public function getService($id = false)
    {
        if ($id === false) {
            return $this->findAll();
        } else {
            return $this->where(['servicetype_id' => $id])->first();
        }
    }

    public function getAllServices()
    {
        return $this->findAll();
    }

    public function getDropOffTypes()
    {
        // table dropoff_types
        $db = \Config\Database::connect();
        $builder = $db->table('dropoff_types');
        return $builder->get()->getResult();
    }

    public function getPackageTypes()
    {
        // table package_types
        $db = \Config\Database::connect();
        $builder = $db->table('package_types');
        return $builder->get()->getResult();
    }

    public function getStateFromZip($zip)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('zipcodes');
        $result = $builder->where('zipcode', $zip)->get()->getRow();
        return $result ? $result->state : 'FL';
    }

    public function getUpcharge($field)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('upcharges');
        $result = $builder->where('field', $field)->get()->getRow();
        return $result ;
    }

    public function getUpcharges()
    {
        $db = \Config\Database::connect();
        $builder = $db->table('upcharges');
        return $builder->get()->getResult();
    }

    public function updateUpcharge($id, $data)
    {
        $db = \Config\Database::connect();
        $builder = $db->table('upcharges');
        $builder->where('id', $id);
        return $builder->update($data);
    }
}