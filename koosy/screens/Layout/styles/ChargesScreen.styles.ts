import { StyleSheet } from 'react-native';

// Styles centralisés pour garder la page des charges lisible et cohérente.
export const createChargesScreenStyles = (colors: {
  background: string;
  surface: string;
  border: string;
  primary: string;
  text: string;
  textSecondary: string;
  shadow: string;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      paddingTop: 8,
    },
    headerSticky: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.border,
      zIndex: 10,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 24,
      paddingVertical: 8,
      paddingHorizontal: 18,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      paddingTop: 18,
      paddingBottom: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.primary,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    },
    summaryBox: {
      flexGrow: 1,
      flexBasis: '31%',
      minWidth: 104,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.primary,
    },
    summaryLabel: {
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.9,
      textAlign: 'center',
    },
    summaryValue: {
      marginTop: 6,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },
    switchRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    switchBtn: {
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    switchText: {
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'center',
    },
    formRow: {
      gap: 10,
    },
    input: {
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    button: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '800',
    },
    periodLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    chargeCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderLeftWidth: 5,
      padding: 14,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    chargeTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    chargeTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    chargeAmount: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary,
    },
    chargeMeta: {
      marginTop: 6,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    deleteButton: {
      marginTop: 10,
      alignSelf: 'flex-end',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    deleteText: {
      fontSize: 13,
      fontWeight: '800',
    },
    emptyState: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 6,
      lineHeight: 18,
    },
  });
