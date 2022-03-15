import { StripeProvider } from '@stripe/stripe-react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Checkout from '../../Components/Checkout/Checkout';




const Payment=({navigation,route})=> {

    return (
        <StripeProvider publishableKey="pk_test_51KcxxpAev9YOfEHruQ3juQb8WJVfIx5x7tWGIJg422c7FF62ouGXhqv274ubbR1324Nmmsnsq88uUymXERR25PU400sra9OGio">
            <Checkout user={route.params.user} plan={route.params.plan} amount={route.params.amount}/>
        </StripeProvider>
    );
}
export default Payment;
const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
},
});
