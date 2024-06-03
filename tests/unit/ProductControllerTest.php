<?php
use App\Controllers\ProductController;
use App\Models\ProductModel;
use CodeIgniter\Test\CIUnitTestCase;

final class ProductControllerTest extends CIUnitTestCase
{
    public function testGenerateSKU(): void
    {
        $controller = new ProductController();

        // Mock the ProductModel class
        $modelMock = $this->getMockBuilder(ProductModel::class)
            ->disableOriginalConstructor()
            ->getMock();

        // Set up the mock to return false for both productExists and variantExists
        $modelMock->expects($this->at(0))
        ->method('getProductBySKU')
        ->with($this->anything())
        ->willReturn(null);

        $modelMock->expects($this->at(1))
            ->method('getProductVariantBySKU')
            ->with($this->anything())
            ->willReturn(null);

        // Set the mock object to the controller
        $controller->setModel($modelMock);

        // Call the generateSKU method
        $sku = $controller->generateSKU();

        // Assert that the generated SKU is not empty
        $this->assertNotEmpty($sku);

        // Assert that the generated SKU starts with 'SKU-'
        $this->assertStringStartsWith('SKU-', $sku);
    }
}