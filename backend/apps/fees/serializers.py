# # apps/fees/serializers.py

# from rest_framework import serializers
# from .models import FeeCategory, FeeStructure, FeePayment


# class FeeCategorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model  = FeeCategory
#         fields = ['id', 'school', 'name', 'description']
#         read_only_fields = ['id', 'school'] 


# class FeeStructureSerializer(serializers.ModelSerializer):
#     category_name  = serializers.CharField(source='category.name',      read_only=True)
#     classroom_name = serializers.CharField(source='classroom.__str__',   read_only=True)

#     class Meta:
#         model  = FeeStructure
#         fields = [
#             'id', 'school', 'classroom', 'classroom_name',
#             'category', 'category_name',
#             'amount', 'frequency', 'academic_year', 'due_day',
#         ]
#         read_only_fields = ['id']


# class FeePaymentSerializer(serializers.ModelSerializer):
#     student_name      = serializers.CharField(source='student.full_name',        read_only=True)
#     category_name     = serializers.CharField(source='fee_structure.category.name', read_only=True)
#     collected_by_name = serializers.CharField(source='collected_by.full_name',   read_only=True)
#     balance           = serializers.SerializerMethodField()

#     class Meta:
#         model  = FeePayment
#         fields = [
#             'id', 'student', 'student_name',
#             'fee_structure', 'category_name',
#             'due_date', 'paid_date',
#             'amount_due', 'amount_paid', 'balance',
#             'status', 'payment_method', 'transaction_id',
#             'collected_by', 'collected_by_name', 'created_at',
#         ]
#         read_only_fields = ['id', 'created_at', 'collected_by']

#     def get_balance(self, obj):
#         return float(obj.amount_due) - float(obj.amount_paid)

#     def create(self, validated_data):
#         validated_data['collected_by'] = self.context['request'].user
#         # Auto-set status
#         amount_due  = validated_data.get('amount_due', 0)
#         amount_paid = validated_data.get('amount_paid', 0)
#         if amount_paid >= amount_due:
#             validated_data['status'] = FeePayment.STATUS_PAID
#         elif amount_paid > 0:
#             validated_data['status'] = FeePayment.STATUS_PARTIAL
#         return super().create(validated_data)

# apps/fees/serializers.py

from rest_framework import serializers
from .models import FeeCategory, FeeStructure, FeePayment


class FeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = FeeCategory
        fields = ['id', 'school', 'name', 'description']
        read_only_fields = ['id', 'school']


class FeeStructureSerializer(serializers.ModelSerializer):
    category_name  = serializers.CharField(
        source='category.name', read_only=True
    )
    classroom_name = serializers.SerializerMethodField()

    class Meta:
        model  = FeeStructure
        fields = [
            'id', 'school', 'classroom', 'classroom_name',
            'category', 'category_name',
            'amount', 'frequency', 'academic_year', 'due_day',
        ]
        read_only_fields = ['id', 'school']

    def get_classroom_name(self, obj):
        if obj.classroom:
            return str(obj.classroom)
        return "All Classes"


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name      = serializers.CharField(
        source='student.full_name', read_only=True
    )
    category_name     = serializers.SerializerMethodField()
    collected_by_name = serializers.CharField(
        source='collected_by.full_name', read_only=True
    )
    balance = serializers.SerializerMethodField()

    class Meta:
        model  = FeePayment
        fields = [
            'id', 'student', 'student_name',
            'fee_structure', 'category_name',
            'due_date', 'paid_date',
            'amount_due', 'amount_paid', 'balance',
            'status', 'payment_method', 'transaction_id',
            'collected_by', 'collected_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'collected_by']

    def get_balance(self, obj):
        return float(obj.amount_due) - float(obj.amount_paid)

    def get_category_name(self, obj):
        try:
            return obj.fee_structure.category.name
        except Exception:
            return ""

    def create(self, validated_data):
        amount_due  = validated_data.get('amount_due', 0)
        amount_paid = validated_data.get('amount_paid', 0)
        if amount_paid >= amount_due:
            validated_data['status'] = FeePayment.STATUS_PAID
        elif amount_paid > 0:
            validated_data['status'] = FeePayment.STATUS_PARTIAL
        return super().create(validated_data)