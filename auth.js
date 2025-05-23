// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkTBWZvm3gAH1njiSHYEPrZUJmF_DBT4c", // Suggestion: Use environment variables in production
    authDomain: "cashless-fee-payment.firebaseapp.com",
    projectId: "cashless-fee-payment",
    storageBucket: "cashless-fee-payment.appspot.com",
    messagingSenderId: "528515335884",
    appId: "1:528515335884:web:3002a89c90844e960b2469"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get auth and firestore instances
const auth = firebase.auth();
const db = firebase.firestore();

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User logged in:", user.email);
        if (window.location.pathname.endsWith('index.html')) {
            window.location.href = 'staff_dashboard.html';
        }
    } else {
        console.log("User logged out");
        if (!window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
        }
    }
});

// Login form handler
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('userId').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = 'staff_dashboard.html';
            })
            .catch((error) => {
                console.error('Login error:', error);

                let errorMessage = 'Incorrect UserID or Password';
                let clearPassword = false;
                let highlightEmail = false;
                let highlightPassword = false;

                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Please enter a valid email address';
                        highlightEmail = true;
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled';
                        highlightEmail = true;
                        break;
                    case 'auth/user-not-found':
                        highlightEmail = true;
                        clearPassword = false;
                        break;
                    case 'auth/wrong-password':
                        highlightPassword = true;
                        clearPassword = true;
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many attempts. Please try again later';
                        clearPassword = true;
                        break;
                }

                errorElement.textContent = errorMessage;
                errorElement.classList.add('visible');

                if (highlightEmail) {
                    document.getElementById('userId').classList.add('input-error');
                }
                if (highlightPassword) {
                    document.getElementById('password').classList.add('input-error');
                }

                if (clearPassword) {
                    document.getElementById('password').value = '';
                }
            });
    });

    document.getElementById('showPassword').addEventListener('change', (e) => {
        const passwordField = document.getElementById('password');
        passwordField.type = e.target.checked ? 'text' : 'password';
    });
}

// Navigation functions
function setupDashboardNavigation() {
    if (document.getElementById('fetch-fee-details-button')) {
        document.getElementById('fetch-fee-details-button').addEventListener('click', () => {
            document.getElementById('dashboard-options').classList.add('hidden');
            document.getElementById('search-section').classList.remove('hidden');
            document.getElementById('add-student-section').classList.add('hidden');
            document.getElementById('student-details-section').classList.add('hidden');
        });
    }

    if (document.getElementById('add-student-button')) {
        document.getElementById('add-student-button').addEventListener('click', () => {
            document.getElementById('dashboard-options').classList.add('hidden');
            document.getElementById('add-student-section').classList.remove('hidden');
            document.getElementById('search-section').classList.add('hidden');
            document.getElementById('student-details-section').classList.add('hidden');
        });
    }

    if (document.getElementById('back-to-dashboard-button')) {
        document.getElementById('back-to-dashboard-button').addEventListener('click', () => {
            document.getElementById('dashboard-options').classList.remove('hidden');
            document.getElementById('search-section').classList.add('hidden');
            document.getElementById('add-student-section').classList.add('hidden');
            document.getElementById('student-details-section').classList.add('hidden');
        });
    }

    if (document.getElementById('back-button')) {
        document.getElementById('back-button').addEventListener('click', () => {
            document.getElementById('search-section').classList.add('hidden');
            document.getElementById('dashboard-options').classList.remove('hidden');
        });
    }

    if (document.getElementById('back-to-dashboard-from-details')) {
        document.getElementById('back-to-dashboard-from-details').addEventListener('click', () => {
            document.getElementById('student-details-section').classList.add('hidden');
            document.getElementById('dashboard-options').classList.remove('hidden');
            document.getElementById('searchStudentId').value = '';
            
            // Clear payment form state when going back to dashboard
            if (document.getElementById('payment-amount')) {
                document.getElementById('payment-amount').value = '';
            }
            if (document.getElementById('payment-message')) {
                document.getElementById('payment-message').textContent = '';
            }
        });
    }

    if (document.getElementById('back-to-dashboard-from-add')) {
        document.getElementById('back-to-dashboard-from-add').addEventListener('click', () => {
            document.getElementById('add-student-section').classList.add('hidden');
            document.getElementById('dashboard-options').classList.remove('hidden');
        });
    }

    if (document.getElementById('back-to-search-button')) {
        document.getElementById('back-to-search-button').addEventListener('click', () => {
            document.getElementById('student-details-section').classList.add('hidden');
            document.getElementById('search-section').classList.remove('hidden');
            document.getElementById('searchStudentId').value = '';
            
            // Clear payment form state when going back to search
            if (document.getElementById('payment-amount')) {
                document.getElementById('payment-amount').value = '';
            }
            if (document.getElementById('payment-message')) {
                document.getElementById('payment-message').textContent = '';
            }
        });
    }

    const showManagementDashboardButton = document.getElementById('show-management-dashboard-button');
    if (showManagementDashboardButton) {
        showManagementDashboardButton.addEventListener('click', () => {
            document.getElementById('dashboard-options').classList.add('hidden');
            document.getElementById('search-section').classList.add('hidden');
            document.getElementById('add-student-section').classList.add('hidden');
            document.getElementById('student-details-section').classList.add('hidden');

            document.getElementById('management-dashboard').classList.remove('hidden');

            loadManagementDashboard();
        });
    }
}
// Add student functionality
if (document.getElementById('add-student-form')) {
    document.getElementById('add-student-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const totalfee = parseFloat(document.getElementById('totalfee').value);
        const balancefee = parseFloat(document.getElementById('balancefee').value);
        const messageElement = document.getElementById('add-student-message');
        
        // Clear previous messages
        messageElement.textContent = '';
        messageElement.style.color = '';
        
        // Validate fees
        if (isNaN(totalfee) || isNaN(balancefee)) {
            messageElement.textContent = 'Please enter valid numbers for fees';
            messageElement.style.color = 'red';
            return;
        }
        
        if (balancefee > totalfee) {
            messageElement.textContent = 'Error: Balance fee cannot be greater than total fee!';
            messageElement.style.color = 'red';
            // Highlight problematic fields
            document.getElementById('totalfee').style.border = '1px solid red';
            document.getElementById('balancefee').style.border = '1px solid red';
            return;
        }
        
        // Prepare student data
        const studentData = {
            studentId: document.getElementById('studentId').value,
            name: document.getElementById('name').value,
            fathername: document.getElementById('fathername').value,
            mothername: document.getElementById('mothername').value,
            mobilenumber: document.getElementById('mobilenumber').value,
            course: document.getElementById('course').value,
            year: document.getElementById('year').value,
            totalfee: totalfee,
            balancefee: balancefee
        };
        
        // Save to database
        db.collection('students').doc(studentData.studentId).set(studentData)
            .then(() => {
                messageElement.textContent = 'Student added successfully!';
                messageElement.style.color = 'green';
                document.getElementById('add-student-form').reset();
                // Remove error highlights
                document.getElementById('totalfee').style.border = '';
                document.getElementById('balancefee').style.border = '';
            })
            .catch((error) => {
                messageElement.textContent = error.message;
                messageElement.style.color = 'red';
            });
    });
}
// Search student functionality
if (document.getElementById('student-search-form')) {
    document.getElementById('student-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const studentId = document.getElementById('searchStudentId').value;
        const errorElement = document.getElementById('search-error');
        
        // Clear payment form state when searching for a student
        if (document.getElementById('payment-amount')) {
            document.getElementById('payment-amount').value = '';
        }
        if (document.getElementById('payment-message')) {
            document.getElementById('payment-message').textContent = '';
        }

        db.collection('students').doc(studentId).get()
            .then((doc) => {
                if (doc.exists) {
                    const studentData = doc.data();
                    console.log("Student found:", studentData);

                    document.getElementById('s-studentId').textContent = studentData.studentId;
                    document.getElementById('s-name').textContent = studentData.name;
                    document.getElementById('s-fathername').textContent = studentData.fathername || '';
                    document.getElementById('s-mothername').textContent = studentData.mothername || '';
                    document.getElementById('s-mobilenumber').textContent = studentData.mobilenumber || '';
                    document.getElementById('s-course').textContent = studentData.course;
                    document.getElementById('s-year').textContent = studentData.year;
                    document.getElementById('s-totalfee').textContent = studentData.totalfee.toFixed(2);
                    document.getElementById('s-balancefee').textContent = studentData.balancefee.toFixed(2);

                    errorElement.textContent = '';
                    document.getElementById('search-section').classList.add('hidden');
                    document.getElementById('student-details-section').classList.remove('hidden');
                    
                    // Skip the blockchain verification UI setup since it's been removed
                    // We no longer need this code since verification happens automatically during payment
                    
                } else {
                    errorElement.textContent = 'No student found with that ID';
                }
            })
            .catch((error) => {
                errorElement.textContent = error.message;
            });
    });
}

// UI helper functions
function showError(element, message) {
    element.textContent = message;
    element.style.color = 'red';
    element.classList.remove('hidden');
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.color = 'green';
    element.classList.remove('hidden');
}

// Payment functionality with multiple payment methods
function setupPayment() {
    const payButton = document.getElementById('pay-fee-button');
    if (!payButton) return;

    // Add input event listener to clear error message when payment amount is changed
    const paymentAmountInput = document.getElementById('payment-amount');
    if (paymentAmountInput) {
        paymentAmountInput.addEventListener('input', () => {
            const messageElement = document.getElementById('payment-message');
            if (messageElement) {
                messageElement.textContent = ''; // Clear the error message
            }
        });
    }

    payButton.addEventListener('click', async () => {
        const studentId = document.getElementById('s-studentId').textContent;
        const currentBalance = parseFloat(document.getElementById('s-balancefee').textContent);
        const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
        const messageElement = document.getElementById('payment-message');
        
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
        
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            showError(messageElement, 'Please enter a valid amount');
            return;
        }
        
        if (paymentAmount > currentBalance) {
            showError(messageElement, 'Payment amount cannot exceed balance fee');
            return;
        }
        
        if (!paymentMethod) {
            showError(messageElement, 'Please select a payment method');
            return;
        }
        
        try {
            switch (paymentMethod) {
                case 'razorpay':
                    const options = {
                        "key": "rzp_test_KhfNnpQCnlC75Z",
                        "amount": paymentAmount * 100,
                        "currency": "INR",
                        "name": "Sri Venkateshwara Engineering College",
                        "description": `Fee Payment for Student ID: ${studentId}`,
                        "handler": async function(response) {
                            await processPaymentAndUpdateDatabase(
                                studentId,
                                paymentAmount,
                                currentBalance,
                                response.razorpay_payment_id,
                                'Razorpay'
                            );
                        },
                        "prefill": {
                            "name": document.getElementById('s-name').textContent
                        },
                        "theme": {
                            "color": "#3399cc"
                        }
                    };
                    const rzp1 = new Razorpay(options);
                    rzp1.open();
                    break;
                    
                case 'cash':
                    const confirmCash = confirm(`Confirm cash payment of ₹${paymentAmount.toFixed(2)}?`);
                    if (confirmCash) {
                        await processPaymentAndUpdateDatabase(
                            studentId,
                            paymentAmount,
                            currentBalance,
                            'CASH-' + Date.now(),
                            'Cash'
                        );
                    }
                    break;
                    
                default:
                    showError(messageElement, 'Invalid payment method selected');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            showError(messageElement, 'Error processing payment. Please try again.');
        }
    });
}

// Unified payment processing function
async function processPaymentAndUpdateDatabase(studentId, paymentAmount, currentBalance, transactionId, paymentMethod) {
    try {
        const newBalance = currentBalance - paymentAmount;
        const processedBy = auth.currentUser.email;

        await db.collection('students').doc(studentId).update({
            balancefee: newBalance,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            payments: firebase.firestore.FieldValue.arrayUnion({
                amount: paymentAmount,
                date: new Date(),
                transactionId: transactionId,
                processedBy: processedBy,
                method: paymentMethod
            })
        });

        // Generate receipt data first to get the receipt number
        const receiptData = {
            studentId,
            studentName: document.getElementById('s-name').textContent,
            fatherName: document.getElementById('s-fathername').textContent,
            course: document.getElementById('s-course').textContent,
            year: document.getElementById('s-year').textContent,
            amountPaid: paymentAmount,
            newBalance,
            transactionId,
            processedBy,
            paymentMethod
        };
        
        // Generate the receipt which will create and store the receipt number
        await generateReceipt(receiptData);
        
        // Now save the payment with the receipt number included
        const paymentData = {
            studentId: studentId,
            studentName: document.getElementById('s-name').textContent,
            amount: paymentAmount,
            date: new Date(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            transactionId: transactionId,
            processedBy: processedBy,
            method: paymentMethod,
            status: 'completed',
            receiptNumber: receiptData.receiptNumber // Add the receipt number to the payment record
        };
        
        // Store payment in Firestore
        await db.collection('payments').doc(transactionId).set(paymentData);

        // Automatic blockchain verification - no UI needed
        try {
            console.log('Starting automatic blockchain verification for transaction:', transactionId);
            
            // Store on blockchain (simulation)
            const storeResult = await window.BitqueryClient.storeTransaction({
                studentId: paymentData.studentId, 
                amount: paymentData.amount, 
                transactionId: transactionId,
                processedBy: paymentData.processedBy,
                paymentMethod: paymentData.method,
                receiptNumber: paymentData.receiptNumber
            });
            
            if (storeResult.success) {
                console.log('Payment stored on blockchain successfully', storeResult);
                
                // Update payment record with blockchain reference
                await db.collection('payments').doc(transactionId).update({
                    blockchainReference: storeResult.blockchainReference,
                    blockNumber: storeResult.blockNumber
                });
                
                // Store in blockchain_verifications collection
                await db.collection('blockchain_verifications').doc(transactionId).set({
                    transactionId: transactionId,
                    studentId: paymentData.studentId,
                    studentName: paymentData.studentName,
                    paymentAmount: paymentData.amount,
                    paymentMethod: paymentData.method,
                    receiptNumber: paymentData.receiptNumber,
                    blockchainReference: storeResult.blockchainReference,
                    blockNumber: storeResult.blockNumber,
                    verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    verifiedBy: auth.currentUser ? auth.currentUser.email : 'system',
                    network: 'polygon', // Specify the blockchain network
                    isSimulated: true // Flag to indicate this is a simulated blockchain transaction
                });
                
                console.log('Blockchain verification data stored in Firebase');
                
                // Now regenerate the receipt with blockchain data
                const updatedReceiptData = {
                    ...receiptData,
                    blockchainReference: storeResult.blockchainReference,
                    blockNumber: storeResult.blockNumber,
                    network: 'polygon'
                };
                
                // Generate an updated receipt with blockchain information
                await generateReceipt(updatedReceiptData);
                
                // Show a simple toast message about the blockchain verification
                window.PaymentAnimations.showToast('Payment verified on blockchain!', 'success');
            } else {
                console.warn('Payment not stored on blockchain:', storeResult.error);
                
                // Store the failure
                await db.collection('blockchain_verification_failures').add({
                    transactionId: transactionId,
                    studentId: paymentData.studentId,
                    error: storeResult.error || 'Unknown error',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    attemptedBy: auth.currentUser ? auth.currentUser.email : 'system'
                });
            }
        } catch (error) {
            console.error('Blockchain verification error:', error);
            
            // Store the failure but don't disrupt payment flow
            await db.collection('blockchain_verification_failures').add({
                transactionId: transactionId,
                studentId: paymentData.studentId,
                error: error.message || 'Exception thrown',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                attemptedBy: auth.currentUser ? auth.currentUser.email : 'system'
            });
        }

        document.getElementById('s-balancefee').textContent = newBalance.toFixed(2);
        document.getElementById('payment-amount').value = '';
        
        // Show the advanced 3D success animation
        window.PaymentAnimations.showSuccessAnimation(paymentAmount, () => {
            // This callback runs after animation completion
            window.PaymentAnimations.showToast(`Payment of ₹${paymentAmount.toFixed(2)} successful!`, 'success');
            
            // After a short delay, show the blockchain verification message
            setTimeout(() => {
                window.PaymentAnimations.showToast('Transaction secured on blockchain', 'success');
            }, 3000);
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        
        // Show the advanced 3D failure animation
        window.PaymentAnimations.showFailureAnimation('Payment processing failed. Please try again.', () => {
            // This callback runs after animation completion or when "Try Again" is clicked
            window.PaymentAnimations.showToast('Payment failed. Please try again.', 'error');
        });
        
        throw error;
    }
}

// Updated receipt generation to show payment method
async function generateReceipt(data) {
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) throw new Error("jspdf library not loaded");
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        // Get current date and time
        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString();
        
        // Add College Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 107, 84); // College color theme
        doc.text("SRI VENKATESHWARA ENGINEERING COLLEGE", pageWidth/2, 20, { align: 'center' });
        
        // Add College Subheader
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Affiliated to JNTU-H, Suryapet-508213, Telangana", pageWidth/2, 28, { align: 'center' });
        
        // Generate a unique receipt number using timestamp and random component
        const timestamp = Date.now();
        const randomComponent = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const receiptNumber = `SVEC-${timestamp.toString().slice(-6)}-${randomComponent}`;
        
        // Store receipt number in data object for database reference
        data.receiptNumber = receiptNumber;
        
        // Add receipt number with bold formatting on left side
        doc.setFillColor(240, 240, 240); // Light gray background
        doc.roundedRect(15, 35, 80, 10, 2, 2, 'F');
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(158, 27, 50); // Crimson color for emphasis
        doc.text(`RECEIPT NO: ${receiptNumber}`, 20, 42);
        
        // Add Receipt Title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`OFFICIAL FEE PAYMENT RECEIPT`, pageWidth/2, 50, { align: 'center' });
        
        // Add receipt details using autoTable
        doc.autoTable({
            startY: 57,
            head: [[
                { content: 'Student Details', styles: { fillColor: [158, 27, 50] } },
                { content: 'Payment Details', styles: { fillColor: [158, 27, 50] } }
            ]],
            body: [
                [
                    `Student ID: ${data.studentId}\nName: ${data.studentName}\nCourse: ${data.course}\nYear: ${data.year}`,
                    `Transaction ID: ${data.transactionId}\nDate: ${formattedDate}\nTime: ${formattedTime}\nPayment Mode: ${data.paymentMethod}`
                ]
            ],
            styles: { cellPadding: 1, fontSize: 10 },
            theme: 'grid'
        });
        
        // Add payment breakdown table
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Description', 'Amount (₹)']],
            body: [
                ['Total Fee', formatCurrency(data.amountPaid + data.newBalance)],
                ['Amount Paid', formatCurrency(data.amountPaid)],
                ['Balance Due', formatCurrency(data.newBalance)]
            ],
            styles: { 
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontSize: 10
            },
            columnStyles: {
                1: { cellWidth: 40, halign: 'right' }
            }
        });

        // Add blockchain verification section with dotted border
        if (data.blockchainReference) {
            doc.setDrawColor(0, 107, 84); // College green color for border
            doc.setDashPattern([1, 1], 0); // Dotted line
            doc.roundedRect(15, doc.lastAutoTable.finalY + 10, pageWidth - 30, 20, 2, 2); // Draw dotted border
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0, 107, 84); // College green color
            doc.text("BLOCKCHAIN VERIFICATION", pageWidth/2, doc.lastAutoTable.finalY + 16, { align: 'center' });
            
            // Add blockchain details
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            
            // Format blockchain reference to fit in the receipt
            const blockchainRef = data.blockchainReference;
            const formattedRef = blockchainRef.length > 40 ? 
                blockchainRef.substring(0, 20) + '...' + blockchainRef.substring(blockchainRef.length - 20) : 
                blockchainRef;
            
            doc.text(`Transaction Hash: ${formattedRef}`, pageWidth/2, doc.lastAutoTable.finalY + 22, { align: 'center' });
            
            // Add QR code with the blockchain reference if QR code plugin is available
            try {
                // If using a QR code plugin, you would add it here
                // As a fallback, we'll just add text
                if (data.blockNumber) {
                    doc.text(`Block #: ${data.blockNumber} • Network: Polygon`, pageWidth/2, doc.lastAutoTable.finalY + 26, { align: 'center' });
                }
            } catch (qrError) {
                console.warn('QR code generation failed:', qrError);
            }
        }

        // Add footer
        const footerY = data.blockchainReference ? 
            doc.lastAutoTable.finalY + 35 : // Space after blockchain section
            doc.lastAutoTable.finalY + 15;  // Standard spacing
            
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Processed by: ${data.processedBy}`, 20, footerY);
        doc.text("This is a computer generated receipt", pageWidth/2, footerY, { align: 'center' });
        doc.text("Thank you for your payment!", pageWidth/2, footerY + 5, { align: 'center' });
        
        // Use receipt number in filename format
        const fileName = `SVEC_Receipt_${receiptNumber}.pdf`;
        doc.save(fileName);
        
        // Store in Firestore
        const pdfData = doc.output('datauristring');
        await db.collection('receipts').doc(data.transactionId).set({
            ...data,
            pdfData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error('PDF generation failed:', error);
        generateSimpleReceipt(data);
    }
}

// Helper function to format currency
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Fallback simple receipt
function generateSimpleReceipt(data) {
    // Generate a unique receipt number if not already created
    if (!data.receiptNumber) {
        const timestamp = Date.now();
        const randomComponent = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        data.receiptNumber = `SVEC-${timestamp.toString().slice(-6)}-${randomComponent}`;
    }
    
    const receiptText =
        "SRI VENKATESHWARA ENGINEERING COLLEGE\n" +
        "-------------------------------------\n" +
        "OFFICIAL FEE PAYMENT RECEIPT\n" +
        "\n" +
        "Receipt No: " + data.receiptNumber + "\n" +
        "Date: " + new Date().toLocaleString() + "\n" +
        "\n" +
        "STUDENT INFORMATION:\n" +
        "-------------------\n" +
        "Student ID: " + data.studentId + "\n" +
        "Name: " + data.studentName + "\n" +
        "Father's Name: " + data.fatherName + "\n" +
        "Course: " + data.course + " (Year " + data.year + ")\n" +
        "\n" +
        "PAYMENT DETAILS:\n" +
        "----------------\n" +
        "Fee Payment: ₹" + data.amountPaid.toFixed(2) + "\n" +
        "Previous Balance: ₹" + (data.amountPaid + data.newBalance).toFixed(2) + "\n" +
        "Amount Paid: ₹" + data.amountPaid.toFixed(2) + "\n" +
        "Remaining Balance: ₹" + data.newBalance.toFixed(2) + "\n" +
        "\n" +
        "Transaction ID: " + data.transactionId + "\n" +
        "Processed by: " + data.processedBy + "\n";

    // Add blockchain information if available
    if (data.blockchainReference) {
        receiptText += "\n" +
            "BLOCKCHAIN VERIFICATION:\n" +
            "------------------------\n" +
            "Transaction Hash: " + data.blockchainReference + "\n" +
            (data.blockNumber ? "Block Number: " + data.blockNumber + "\n" : "") +
            "Network: " + (data.network || "Polygon") + "\n";
    }
    
    receiptText += "\n" +
        "This is a computer generated receipt.\n" +
        "Thank you for your payment!\n";

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SVEC_Receipt_${data.studentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Logout functionality
if (document.getElementById('logout-button')) {
    document.getElementById('logout-button').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Logout failed:', error);
        });
    });
}

// Navigation functions to show sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.classList.add('hidden'));
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupDashboardNavigation();
    setupPayment();

    const showManagementDashboardButton = document.getElementById('show-management-dashboard-button');
    if (showManagementDashboardButton) {
        showManagementDashboardButton.addEventListener('click', () => {
            showSection('dashboard-options');
            showSection('search-section');
            showSection('add-student-section');
            showSection('student-details-section');

            showSection('management-dashboard');

            loadManagementDashboard();
        });
    }
});
// Add these functions to auth.js

// Management Dashboard Functions
async function loadManagementDashboard() {
    try {
        const students = await db.collection('students').get();
        document.getElementById('total-students').textContent = students.size;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const payments = await db.collection('payments')
            .where('timestamp', '>=', startOfDay)
            .where('timestamp', '<', endOfDay)
            .get();

        updateDailyStats(payments);

        loadRecentPayments();

        setupRealTimeUpdates();

    } catch (error) {
        console.error('Dashboard load error:', error);
        showError(document.getElementById('payment-message'), 'Failed to load dashboard data');
    }
}

function updateDailyStats(payments) {
    const dailyTotal = payments.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
    document.getElementById('daily-total').textContent = dailyTotal.toFixed(2);
    document.getElementById('daily-count').textContent = payments.size;
}

async function loadRecentPayments() {
    const paymentsSnapshot = await db.collection('payments')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

    const paymentsData = await Promise.all(paymentsSnapshot.docs.map(async doc => {
        const paymentData = doc.data();
        const studentDoc = await db.collection('students').doc(paymentData.studentId).get();
        const studentData = studentDoc.data();
        return {
            ...paymentData,
            studentName: studentData?.name || 'N/A',
            course: studentData?.course || 'N/A',
            year: studentData?.year || 'N/A'
        };
    }));

    updateRecentPaymentsUI({ docs: paymentsSnapshot.docs.map((doc, index) => ({ id: doc.id, data: () => paymentsData[index] })) });
}

function updateRecentPaymentsUI(payments) {
    const recentList = document.getElementById('recent-payments-list');
    recentList.innerHTML = payments.docs.map(doc => {
        const data = doc.data();
        const formattedDate = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'N/A';
        const amount = data.amount?.toFixed(2) || '0.00';

        return `
            <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                <p><strong>Student ID:</strong> ${data.studentId}</p>
                <p><strong>Name:</strong> ${data.studentName}</p>
                <p><strong>Course:</strong> ${data.course} (Year ${data.year})</p>
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
            </div>
        `;
    }).join('');

    if (payments.empty) {
        recentList.innerHTML = '<p>No recent transactions found.</p>';
    }
}

// Real-time updates
function setupRealTimeUpdates() {
    db.collection('students').onSnapshot(snap => {
        document.getElementById('total-students').textContent = snap.size;
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    db.collection('payments')
        .where('timestamp', '>=', startOfDay)
        .where('timestamp', '<', endOfDay)
        .onSnapshot(snap => {
            updateDailyStats(snap);
        });

    db.collection('payments')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .onSnapshot(async snap => {
            const paymentsData = await Promise.all(snap.docs.map(async doc => {
                const paymentData = doc.data();
                const studentDoc = await db.collection('students').doc(paymentData.studentId).get();
                const studentData = studentDoc.data();
                return {
                    ...paymentData,
                    studentName: studentData?.name || 'N/A',
                    course: studentData?.course || 'N/A',
                    year: studentData?.year || 'N/A'
                };
            }));
            updateRecentPaymentsUI({ docs: snap.docs.map((doc, index) => ({ id: doc.id, data: () => paymentsData[index] })) });
        });
}

// Payment history search
async function searchPaymentHistory() {
    const studentId = document.getElementById('payment-search-id').value.trim();
    if (!studentId) return;

    try {
        const payments = await db.collection('payments')
            .where('studentId', '==', studentId)
            .orderBy('timestamp', 'desc')
            .get();

        updatePaymentHistoryUI(payments);
    } catch (error) {
        console.error('Payment history error:', error);
        showError(document.getElementById('payment-message'), 'Failed to load payment history');
    }
}

function updatePaymentHistoryUI(payments) {
    const historyList = document.getElementById('payment-history-list');
    historyList.innerHTML = payments.docs.map(doc => {
        const data = doc.data();
        const formattedDate = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'N/A';
        const formattedTime = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : 'N/A';
        const amount = data.amount?.toFixed(2) || '0.00';
        const method = data.method || 'N/A';
        const transactionId = data.transactionId || 'N/A';
        const processedBy = data.processedBy || 'N/A';

        return `
            <div class="payment-record">
                <p><strong>Date:</strong> ${formattedDate} ${formattedTime}</p>
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>Payment Mode:</strong> ${method}</p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Processed By:</strong> ${processedBy}</p>
                <hr>
            </div>
        `;
    }).join('');

    if (payments.empty) {
        historyList.innerHTML = '<p>No payment history found for this student.</p>';
    }
}

// Replace with automatic blockchain verification function
async function storeTransactionOnBlockchain(payment) {
    try {
        if (!payment || !payment.id) {
            console.error('Invalid payment data for blockchain storage');
            return;
        }
        
        const transactionId = payment.id;
        
        // Check if BitqueryClient is available
        if (!window.BitqueryClient) {
            console.warn('Bitquery client not available for transaction', transactionId);
            return;
        }
        
        // Store on blockchain (simulation)
        const storeResult = await window.BitqueryClient.storeTransaction({
            studentId: payment.studentId, 
            amount: payment.amount, 
            transactionId: transactionId,
            processedBy: payment.processedBy,
            paymentMethod: payment.paymentMethod,
            receiptNumber: payment.receiptNumber
        });
        
        if (storeResult.success) {
            console.log('Payment stored on blockchain successfully', storeResult);
            
            // Update payment record with blockchain reference
            await db.collection('payments').doc(transactionId).update({
                blockchainReference: storeResult.blockchainReference,
                blockNumber: storeResult.blockNumber
            });
            
            // Store in blockchain_verifications collection
            await db.collection('blockchain_verifications').doc(transactionId).set({
                transactionId: transactionId,
                studentId: payment.studentId,
                studentName: payment.studentName,
                paymentAmount: payment.amount,
                paymentMethod: payment.paymentMethod,
                receiptNumber: payment.receiptNumber,
                blockchainReference: storeResult.blockchainReference,
                blockNumber: storeResult.blockNumber,
                verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
                verifiedBy: auth.currentUser ? auth.currentUser.email : 'system',
                network: 'polygon', // Specify the blockchain network
                isSimulated: true // Flag to indicate this is a simulated blockchain transaction
            });
            
            console.log('Blockchain verification data stored in Firebase');
        } else {
            console.warn('Payment not stored on blockchain:', storeResult.error);
            
            // Store the failure
            await db.collection('blockchain_verification_failures').add({
                transactionId: transactionId,
                studentId: payment.studentId,
                error: storeResult.error || 'Unknown error',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                attemptedBy: auth.currentUser ? auth.currentUser.email : 'system'
            });
        }
    } catch (error) {
        console.error('Blockchain storage error:', error);
        
        // Store the failure
        await db.collection('blockchain_verification_failures').add({
            transactionId: payment.id,
            studentId: payment.studentId,
            error: error.message || 'Exception thrown',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            attemptedBy: auth.currentUser ? auth.currentUser.email : 'system'
        });
    }
}

// Process payment
// ... existing code ...

// When a payment is successfully processed, store on blockchain automatically
db.collection('payments').doc(paymentId).set(paymentData)
    .then(async () => {
        // ... existing code ...
        
        // Store transaction on blockchain automatically after payment is processed
        await storeTransactionOnBlockchain(paymentData);
        
        // ... existing code ...
    })
    .catch(error => {
        // ... existing code ...
    });

// ... existing code ...

// Store transaction on blockchain using Bitquery (if available)
if (window.BitqueryClient) {
    window.BitqueryClient.storeTransaction({
        studentId: paymentData.studentId, 
        amount: paymentData.amount, 
        transactionId: paymentId,
        processedBy: paymentData.processedBy,
        paymentMethod: paymentData.paymentMethod,
        receiptNumber: paymentData.receiptNumber
    }).then(result => {
        if (result.success) {
            console.log('Payment stored on blockchain successfully', result);
            // Update payment record with blockchain reference
            db.collection('payments').doc(paymentId).update({
                blockchainReference: result.blockchainReference,
                blockNumber: result.blockNumber
            }).catch(err => console.error('Error updating blockchain reference:', err));
        } else {
            console.warn('Payment not stored on blockchain:', result.error);
        }
    }).catch(err => console.error('Blockchain storage error:', err));
}

// ... existing code ...


