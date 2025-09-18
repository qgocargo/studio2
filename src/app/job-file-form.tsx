
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  FilePlus,
  Save,
  Printer,
  Trash2,
  FolderOpen,
  Users2,
} from 'lucide-react';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


// Define the structure for a charge item
interface Charge {
  id: number;
  description: string;
  cost: string;
  selling: string;
  profit: number;
  notes: string;
}

// Define the props for our component
interface JobFileFormProps {
    user: {
        uid: string;
        displayName: string;
        role: string;
    } | null;
}


export function JobFileForm({ user }: JobFileFormProps) {
  const { toast } = useToast();

  // State for all form fields
  const [formData, setFormData] = useState({
    date: '',
    poNumber: '',
    jobFileNo: '',
    clearance: {
      export: false,
      import: false,
      clearance: false,
      local: false,
    },
    productType: {
      air: false,
      sea: false,
      land: false,
      others: false,
    },
    invoiceNo: '',
    billingDate: '',
    salesman: '',
    shipperName: '',
    consigneeName: '',
    mawb: '',
    hawb: '',
    teamsOfShipping: '',
    origin: '',
    noOfPieces: '',
    grossWeight: '',
    destination: '',
    volumeWeight: '',
    description: '',
    carrier: '',
    truckNo: '',
    vesselName: '',
    flightVoyageNo: '',
    containerNo: '',
    remarks: '',
  });

  const [charges, setCharges] = useState<Charge[]>([
    { id: 1, description: '', cost: '', selling: '', profit: 0, notes: '' },
  ]);

  const [isSaving, setIsSaving] = useState(false);


  // Handler for simple input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handler for checkbox changes
  const handleCheckboxChange = (category: 'clearance' | 'productType', id: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: !prev[category][id as keyof typeof prev[category]],
      },
    }));
  };

    // Handle changes in the charges table
  const handleChargeChange = (index: number, field: keyof Charge, value: string | number) => {
    const newCharges = [...charges];
    const charge = newCharges[index];

    if (field === 'cost' || field === 'selling') {
        const numericValue = value === '' ? '' : String(value);
        (charge as any)[field] = numericValue;

        const cost = parseFloat(charge.cost || '0');
        const selling = parseFloat(charge.selling || '0');
        charge.profit = selling - cost;
    } else {
        (charge as any)[field] = value;
    }
    
    setCharges(newCharges);
  };
  
  // Add a new charge row
  const addChargeRow = () => {
    setCharges([
      ...charges,
      { id: Date.now(), description: '', cost: '', selling: '', profit: 0, notes: '' },
    ]);
  };

  // Remove a charge row
  const removeChargeRow = (index: number) => {
    if (charges.length > 1) {
      const newCharges = charges.filter((_, i) => i !== index);
      setCharges(newCharges);
    } else {
         toast({
            variant: "destructive",
            title: "Cannot Remove",
            description: "At least one charge line must be present.",
        });
    }
  };

  // Calculate totals for the footer
  const totalCost = charges.reduce((acc, charge) => acc + parseFloat(charge.cost || '0'), 0);
  const totalSelling = charges.reduce((acc, charge) => acc + parseFloat(charge.selling || '0'), 0);
  const totalProfit = charges.reduce((acc, charge) => acc + charge.profit, 0);


  const handleSave = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to save a job file.",
        });
        return;
    }

    if (!formData.jobFileNo) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Job File No. is a required field.",
        });
        return;
    }
     setIsSaving(true);
    
    try {
        const jobFileData = {
            ...formData,
            charges: charges.map(c => ({...c, cost: parseFloat(c.cost || '0'), selling: parseFloat(c.selling || '0')})),
            totals: {
                totalCost,
                totalSelling,
                totalProfit,
            },
            status: 'pending', // Default status
            preparedBy: {
                uid: user.uid,
                name: user.displayName,
            },
            checkedBy: null,
            approvedBy: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "jobfiles"), jobFileData);
        
        toast({
            title: "Success!",
            description: `Job File ${formData.jobFileNo} has been saved with ID: ${docRef.id}`,
        });

        // Optionally, reset the form here
        // resetForm(); 

    } catch (error) {
        console.error("Error saving document: ", error);
        toast({
            variant: "destructive",
            title: "Save Error",
            description: "Could not save the job file. Please check the console for details.",
        });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Image
            src="http://qgocargo.com/logo.png"
            alt="Q'go Cargo Logo"
            width={64}
            height={64}
            className="h-16 w-auto mr-4"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 border-l-4 border-gray-300 pl-4">
            JOB FILE
          </h1>
        </div>
        <div className="text-right w-full sm:w-auto space-y-2">
          <div className="flex items-center">
            <Label htmlFor="date" className="mr-2 font-semibold text-gray-700">
              Date:
            </Label>
            <Input type="date" id="date" value={formData.date} onChange={handleInputChange} className="w-full sm:w-40" />
          </div>
          <div className="flex items-center">
            <Label
              htmlFor="poNumber"
              className="mr-2 font-semibold text-gray-700"
            >
              P.O. #:
            </Label>
            <Input type="text" id="poNumber" value={formData.poNumber} onChange={handleInputChange} className="w-full sm:w-40" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Label
            htmlFor="jobFileNo"
            className="block mb-1 font-semibold text-gray-700"
          >
            Job File No.:
          </Label>
          <Input
            type="text"
            id="jobFileNo"
            value={formData.jobFileNo}
            onChange={handleInputChange}
            placeholder="Enter a unique ID here..."
          />
        </div>
        <div className="flex items-end space-x-8 pb-1">
          <div>
            <span className="font-semibold text-gray-700">Clearance</span>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <Checkbox id="export" checked={formData.clearance.export} onCheckedChange={() => handleCheckboxChange('clearance', 'export')} />
                <Label htmlFor="export" className="ml-2">
                  Export
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="import" checked={formData.clearance.import} onCheckedChange={() => handleCheckboxChange('clearance', 'import')} />
                <Label htmlFor="import" className="ml-2">
                  Import
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="clearance" checked={formData.clearance.clearance} onCheckedChange={() => handleCheckboxChange('clearance', 'clearance')} />
                <Label htmlFor="clearance" className="ml-2">
                  Clearance
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="local" checked={formData.clearance.local} onCheckedChange={() => handleCheckboxChange('clearance', 'local')} />
                <Label htmlFor="local" className="ml-2">
                  Local Move
                </Label>
              </div>
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Product Type</span>
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <Checkbox id="air" checked={formData.productType.air} onCheckedChange={() => handleCheckboxChange('productType', 'air')}/>
                <Label htmlFor="air" className="ml-2">
                  Air Freight
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="sea" checked={formData.productType.sea} onCheckedChange={() => handleCheckboxChange('productType', 'sea')}/>
                <Label htmlFor="sea" className="ml-2">
                  Sea Freight
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="land" checked={formData.productType.land} onCheckedChange={() => handleCheckboxChange('productType', 'land')}/>
                <Label htmlFor="land" className="ml-2">
                  Land Freight
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="others" checked={formData.productType.others} onCheckedChange={() => handleCheckboxChange('productType', 'others')}/>
                <Label htmlFor="others" className="ml-2">
                  Others
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <Label
            htmlFor="invoiceNo"
            className="block mb-1 font-semibold text-gray-700"
          >
            Invoice No.:
          </Label>
          <Input type="text" id="invoiceNo" value={formData.invoiceNo} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="billingDate"
            className="block mb-1 font-semibold text-gray-700"
          >
            Billing Date:
          </Label>
          <Input type="date" id="billingDate" value={formData.billingDate} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="salesman"
            className="block mb-1 font-semibold text-gray-700"
          >
            Salesman:
          </Label>
          <Input type="text" id="salesman" value={formData.salesman} onChange={handleInputChange} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label
            htmlFor="shipperName"
            className="block mb-1 font-semibold text-gray-700"
          >
            Shipper's Name:
          </Label>
          <Input type="text" id="shipperName" value={formData.shipperName} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="consigneeName"
            className="block mb-1 font-semibold text-gray-700"
          >
            Consignee's Name:
          </Label>
          <Input type="text" id="consigneeName" value={formData.consigneeName} onChange={handleInputChange} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div>
          <Label htmlFor="mawb" className="block mb-1 font-semibold text-gray-700">
            MAWB / OBL / TCN No.:
          </Label>
          <Input type="text" id="mawb" value={formData.mawb} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="hawb"
            className="block mb-1 font-semibold text-gray-700"
          >
            HAWB / HBL:
          </Label>
          <Input type="text" id="hawb" value={formData.hawb} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="teamsOfShipping"
            className="block mb-1 font-semibold text-gray-700"
          >
            Teams of Shipping:
          </Label>
          <Input type="text" id="teamsOfShipping" value={formData.teamsOfShipping} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="origin"
            className="block mb-1 font-semibold text-gray-700"
          >
            Origin:
          </Label>
          <Input type="text" id="origin" value={formData.origin} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="noOfPieces"
            className="block mb-1 font-semibold text-gray-700"
          >
            No. of Pieces:
          </Label>
          <Input type="text" id="noOfPieces" value={formData.noOfPieces} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="grossWeight"
            className="block mb-1 font-semibold text-gray-700"
          >
            Gross Weight:
          </Label>
          <Input type="text" id="grossWeight" value={formData.grossWeight} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="destination"
            className="block mb-1 font-semibold text-gray-700"
          >
            Destination:
          </Label>
          <Input type="text" id="destination" value={formData.destination} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="volumeWeight"
            className="block mb-1 font-semibold text-gray-700"
          >
            Volume Weight:
          </Label>
          <Input type="text" id="volumeWeight" value={formData.volumeWeight} onChange={handleInputChange} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="sm:col-span-2">
          <Label
            htmlFor="description"
            className="block mb-1 font-semibold text-gray-700"
          >
            Description:
          </Label>
          <Input type="text" id="description" value={formData.description} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="carrier"
            className="block mb-1 font-semibold text-gray-700"
          >
            Carrier / Shipping Line / Trucking Co:
          </Label>
          <Input type="text" id="carrier" value={formData.carrier} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="truckNo"
            className="block mb-1 font-semibold text-gray-700"
          >
            Truck No. / Driver's Name:
          </Label>
          <Input type="text" id="truckNo" value={formData.truckNo} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="vesselName"
            className="block mb-1 font-semibold text-gray-700"
          >
            Vessel's Name:
          </Label>
          <Input type="text" id="vesselName" value={formData.vesselName} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="flightVoyageNo"
            className="block mb-1 font-semibold text-gray-700"
          >
            Flight / Voyage No.:
          </Label>
          <Input type="text" id="flightVoyageNo" value={formData.flightVoyageNo} onChange={handleInputChange} />
        </div>
        <div>
          <Label
            htmlFor="containerNo"
            className="block mb-1 font-semibold text-gray-700"
          >
            Container No.:
          </Label>
          <Input type="text" id="containerNo" value={formData.containerNo} onChange={handleInputChange} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Charges</h2>
        <div>
          <Button variant="outline" size="sm">
            Manage Descriptions
          </Button>
          <Button variant="default" size="sm" className="ml-2">
            Suggest Charges ✨
          </Button>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto border border-gray-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">Description</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Selling</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {charges.map((charge, index) => (
              <TableRow key={charge.id}>
                <TableCell>
                  <Input 
                    placeholder="Charge description..." 
                    value={charge.description}
                    onChange={(e) => handleChargeChange(index, 'description', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={charge.cost}
                    onChange={(e) => handleChargeChange(index, 'cost', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={charge.selling}
                    onChange={(e) => handleChargeChange(index, 'selling', e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-right">{charge.profit.toFixed(3)}</TableCell>
                <TableCell>
                  <Input 
                    placeholder="Notes..." 
                    value={charge.notes}
                    onChange={(e) => handleChargeChange(index, 'notes', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => removeChargeRow(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="text-right">TOTAL:</TableCell>
              <TableCell className="text-right">{totalCost.toFixed(3)}</TableCell>
              <TableCell className="text-right">{totalSelling.toFixed(3)}</TableCell>
              <TableCell className="text-right text-green-600">
                {totalProfit.toFixed(3)}
              </TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div className="text-right mb-6">
        <Button variant="outline" size="sm" onClick={addChargeRow}>
          + Add Charge
        </Button>
      </div>

      <div className="flex justify-between items-center mb-2">
        <Label htmlFor="remarks" className="block font-semibold text-gray-700">
          REMARKS:
        </Label>
        <Button variant="default" size="sm">
          Generate Remarks ✨
        </Button>
      </div>
      <div className="mb-8">
        <Textarea id="remarks" rows={4} value={formData.remarks} onChange={handleInputChange} />
      </div>

      <footer className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t items-end">
        <div>
          <Label
            className="block mb-2 font-semibold text-gray-700"
          >
            PREPARED BY
          </Label>
          <Input type="text" id="prepared-by" readOnly value={user?.displayName || ''} />
        </div>
        <div>
          <Label className="block mb-2 font-semibold text-gray-700">
            CHECKED BY
          </Label>
          <Input type="text" id="checked-by" readOnly />
        </div>
        <div>
          <Label className="block mb-2 font-semibold text-gray-700">
            APPROVED BY
          </Label>
          <Input type="text" id="approved-by" readOnly />
        </div>
      </footer>

      <div className="text-center mt-10 flex flex-wrap justify-center gap-2 sm:gap-4">
        <Button variant="secondary">
          <Users2 />
          Clients
        </Button>
        <Button variant="secondary">
          <FolderOpen />
          File Manager
        </Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={isSaving}>
          <Save />
          {isSaving ? 'Saving...' : 'Save to DB'}
        </Button>
        <Button variant="outline">
          <FilePlus />
          New Job
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Printer />
          Print
        </Button>
      </div>
    </div>
  );
}

